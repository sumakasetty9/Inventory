import { useState, useEffect, useCallback } from 'react'
import { jsPDF } from 'jspdf'
import * as api from '../api'
import './BuyPage.css'

export default function BuyPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState([])
  const [addQty, setAddQty] = useState({})
  const [selling, setSelling] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)
  const [limitPopup, setLimitPopup] = useState(null)

  const getInCart = (product_id) =>
    cart.find((c) => c.product_id === product_id)?.quantity ?? 0

  const getAddQty = (product_id, maxQty) =>
    Math.min(maxQty, Math.max(1, addQty[product_id] ?? 1))
  const setAddQtyFor = (product_id, value, maxQty) => {
    const n = Math.min(maxQty, Math.max(1, value))
    setAddQty((prev) => ({ ...prev, [product_id]: n }))
  }

  const load = useCallback(async () => {
    setError(null)
    setInfoMessage(null)
    try {
      const list = await api.getProducts()
      setProducts(list)
    } catch (e) {
      setError(e.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addToCart = (p, qty = 1) => {
    setError(null)
    setInfoMessage(null)
    const inCart = getInCart(p.product_id)
    const availableToAdd = p.quantity - inCart
    if (availableToAdd <= 0) {
      setError(
        `No more "${p.product_name}" available. In cart: ${inCart}, in stock: ${p.quantity}.`
      )
      return
    }
    const toAdd = Math.min(qty, availableToAdd)
    if (toAdd < qty) {
      setLimitPopup({
        productName: p.product_name,
        available: availableToAdd,
        added: availableToAdd,
        context: 'add',
      })
    }
    setCart((prev) => {
      const i = prev.findIndex((c) => c.product_id === p.product_id)
      if (i >= 0) {
        const next = [...prev]
        const newQty = prev[i].quantity + toAdd
        next[i] = { ...next[i], quantity: newQty, maxQty: p.quantity }
        return next
      }
      return [
        ...prev,
        {
          product_id: p.product_id,
          product_name: p.product_name,
          price: Number(p.price) || 0,
          quantity: toAdd,
          maxQty: p.quantity,
        },
      ]
    })
  }

  const setCartQty = (product_id, quantity) => {
    setError(null)
    setInfoMessage(null)
    const product = products.find((p) => p.product_id === product_id)
    const maxAllowed = product != null ? product.quantity : null
    const n = Math.max(0, quantity)
    if (maxAllowed != null && n > maxAllowed) {
      const cartItem = cart.find((c) => c.product_id === product_id)
      setLimitPopup({
        productName: cartItem?.product_name ?? 'This product',
        available: maxAllowed,
        added: maxAllowed,
        context: 'cart',
      })
    }
    setCart((prev) => {
      if (n <= 0) return prev.filter((c) => c.product_id !== product_id)
      return prev.map((c) => {
        if (c.product_id !== product_id) return c
        const cap = maxAllowed != null ? Math.min(n, maxAllowed) : n
        return { ...c, quantity: cap, maxQty: maxAllowed ?? c.maxQty }
      })
    })
  }

  const removeFromCart = (product_id) => {
    setCart((prev) => prev.filter((c) => c.product_id !== product_id))
  }

  const cartTotal = cart.reduce(
    (sum, c) => sum + (Number(c.price) || 0) * c.quantity,
    0
  )

  const handleCompleteSale = async () => {
    if (cart.length === 0) return
    setError(null)
    setSelling(true)
    const invoiceLines = cart.map((c) => ({
      product_name: c.product_name,
      quantity: c.quantity,
      unit_price: Number(c.price) || 0,
      line_total: (Number(c.price) || 0) * c.quantity,
    }))
    try {
      for (const item of cart) {
        await api.sellProduct(item.product_id, item.quantity)
      }
      setInvoice({
        id: 'INV-' + Date.now(),
        date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        items: invoiceLines,
        total: cartTotal,
      })
      setCart([])
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSelling(false)
    }
  }

  const downloadInvoice = () => {
    if (!invoice) return
    const pdf = buildInvoicePdf(invoice)
    pdf.save(`invoice-${invoice.id}.pdf`)
  }

  const closeInvoice = () => setInvoice(null)

  return (
    <div className="buy-page">
      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}
      {infoMessage && (
        <div className="banner banner-info" role="status">
          {infoMessage}
        </div>
      )}

      {limitPopup && (
        <div
          className="limit-popup-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="limit-popup-title"
        >
          <div className="limit-popup">
            <h3 id="limit-popup-title" className="limit-popup-title">
              Quantity limited
            </h3>
            <p className="limit-popup-message">
              <strong>"{limitPopup.productName}"</strong> only has{' '}
              <strong>{limitPopup.available}</strong> quantity available.
              {limitPopup.context === 'add' ? (
                <> That amount has been added to your cart.</>
              ) : (
                <> Cart quantity has been set to {limitPopup.added}.</>
              )}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setLimitPopup(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <section className="section products-section">
        <h2 className="section-title">Products</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : products.length === 0 ? (
          <p className="muted">No products available.</p>
        ) : (
          <ul className="product-list">
            {products.map((p) => {
              const inCart = getInCart(p.product_id)
              const availableToAdd = p.quantity - inCart
              return (
                <li key={p.product_id} className="product-row">
                  <div className="product-info">
                    <span className="product-name">{p.product_name}</span>
                    <span className="product-meta">
                      {formatPrice(p.price)} per unit
                    </span>
                    <span className="stock-cart-alert">
                      {p.quantity} in stock
                      {inCart > 0 && (
                        <> · <strong>{inCart}</strong> in cart</>
                      )}
                    </span>
                  </div>
                  <div className="add-cart">
                    <button
                      type="button"
                      className="btn-ghost btn-stepper"
                      onClick={() =>
                        setAddQtyFor(p.product_id, getAddQty(p.product_id, availableToAdd) - 1, availableToAdd)
                      }
                      disabled={availableToAdd <= 0 || getAddQty(p.product_id, availableToAdd) <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={availableToAdd <= 0 ? 0 : 1}
                      max={availableToAdd}
                      value={getAddQty(p.product_id, availableToAdd)}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        setAddQtyFor(p.product_id, isNaN(v) ? 1 : v, availableToAdd)
                      }}
                      className="cart-qty-input"
                    />
                    <button
                      type="button"
                      className="btn-ghost btn-stepper"
                      onClick={() =>
                        setAddQtyFor(p.product_id, getAddQty(p.product_id, availableToAdd) + 1, availableToAdd)
                      }
                      disabled={availableToAdd <= 0 || getAddQty(p.product_id, availableToAdd) >= availableToAdd}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => addToCart(p, getAddQty(p.product_id, availableToAdd))}
                      disabled={availableToAdd <= 0}
                    >
                      Add to cart
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="section cart-section">
        <h2 className="section-title">Cart</h2>
        {cart.length === 0 ? (
          <p className="muted">Cart is empty. Add products above.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Line total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((c) => {
                    const product = products.find((p) => p.product_id === c.product_id)
                    const available = product != null ? product.quantity : c.maxQty
                    return (
                      <tr key={c.product_id}>
                        <td className="col-name">
                          <span>{c.product_name}</span>
                          <span className="cart-row-available">
                            Available: {available}
                          </span>
                        </td>
                        <td className="col-qty-cart">
                          <div className="cart-qty-controls">
                            <button
                              type="button"
                              className="btn-ghost btn-stepper"
                              onClick={() =>
                                setCartQty(c.product_id, c.quantity - 1)
                              }
                              aria-label="Decrease"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={available}
                              value={c.quantity}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10)
                                setCartQty(
                                  c.product_id,
                                  isNaN(v) ? 1 : Math.min(available, Math.max(1, v))
                                )
                              }}
                              className="cart-qty-input-inline"
                            />
                            <button
                              type="button"
                              className="btn-ghost btn-stepper"
                              onClick={() =>
                                setCartQty(c.product_id, c.quantity + 1)
                              }
                              disabled={c.quantity >= available}
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="col-num">{formatPrice(c.price)}</td>
                        <td className="col-num">
                          {formatPrice((Number(c.price) || 0) * c.quantity)}
                        </td>
                        <td className="col-actions">
                          <button
                            type="button"
                            className="btn-ghost btn-sm"
                            onClick={() => removeFromCart(c.product_id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="cart-total">
              <strong>Total: {formatPrice(cartTotal)}</strong>
            </div>
            <button
              type="button"
              className="btn-primary btn-complete"
              onClick={handleCompleteSale}
              disabled={selling}
            >
              {selling ? 'Processing…' : 'Complete sale'}
            </button>
          </>
        )}
      </section>

      {invoice && (
        <div className="invoice-overlay" role="dialog" aria-modal="true">
          <div className="invoice-modal">
            <h2 className="invoice-title">Invoice {invoice.id}</h2>
            <p className="invoice-date">Date: {invoice.date} UTC</p>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((line, i) => (
                  <tr key={i}>
                    <td>{line.product_name}</td>
                    <td>{line.quantity}</td>
                    <td>{formatPrice(line.unit_price)}</td>
                    <td>{formatPrice(line.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="invoice-grand-total">
              <strong>Total: {formatPrice(invoice.total)}</strong>
            </p>
            <div className="invoice-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={downloadInvoice}
              >
                Download invoice
              </button>
              <button type="button" className="btn-ghost" onClick={closeInvoice}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatPrice(n) {
  if (n == null || isNaN(n)) return '0.00'
  return Number(n).toFixed(2)
}

function buildInvoicePdf(inv) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(`Invoice ${inv.id}`, 14, 20)
  doc.setFontSize(11)
  doc.text(`Date: ${inv.date} UTC`, 14, 28)
  doc.setFontSize(10)
  let y = 40
  doc.setFont(undefined, 'bold')
  doc.text('Product', 14, y)
  doc.text('Qty', 80, y)
  doc.text('Unit price', 100, y)
  doc.text('Total', 140, y)
  doc.setFont(undefined, 'normal')
  y += 6
  inv.items.forEach((l) => {
    doc.text(l.product_name.substring(0, 35), 14, y)
    doc.text(String(l.quantity), 80, y)
    doc.text(formatPrice(l.unit_price), 100, y)
    doc.text(formatPrice(l.line_total), 140, y)
    y += 6
  })
  y += 4
  doc.setFont(undefined, 'bold')
  doc.text(`Total: ${formatPrice(inv.total)}`, 14, y)
  return doc
}
