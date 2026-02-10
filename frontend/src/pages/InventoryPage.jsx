import { useState, useEffect, useCallback } from 'react'
import * as api from '../api'
import './InventoryPage.css'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [editingQty, setEditingQty] = useState(null)
  const [qtyInput, setQtyInput] = useState('')
  const [editingPrice, setEditingPrice] = useState(null)
  const [priceInput, setPriceInput] = useState('')

  const load = useCallback(async () => {
    setError(null)
    try {
      const [list, low] = await Promise.all([
        api.getProducts(),
        api.getLowStock(),
      ])
      setProducts(list)
      setLowStock(low)
    } catch (e) {
      setError(e.message)
      setProducts([])
      setLowStock([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = productName.trim()
    const q = parseInt(quantity, 10)
    const pr = parseFloat(price)
    if (!name || isNaN(q) || q < 0) return
    setError(null)
    try {
      await api.addProduct(name, q, isNaN(pr) || pr < 0 ? 0 : pr)
      setProductName('')
      setQuantity('')
      setPrice('')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEditQty = (p) => {
    setEditingQty(p.product_id)
    setQtyInput(String(p.quantity))
  }
  const cancelEditQty = () => {
    setEditingQty(null)
    setQtyInput('')
  }
  const saveQty = async () => {
    const id = editingQty
    const q = parseInt(qtyInput, 10)
    if (isNaN(q) || q < 0) return
    setError(null)
    try {
      await api.updateQuantity(id, q)
      setEditingQty(null)
      setQtyInput('')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEditPrice = (p) => {
    setEditingPrice(p.product_id)
    setPriceInput(String(p.price ?? 0))
  }
  const cancelEditPrice = () => {
    setEditingPrice(null)
    setPriceInput('')
  }
  const savePrice = async () => {
    const id = editingPrice
    const pr = parseFloat(priceInput)
    if (isNaN(pr) || pr < 0) return
    setError(null)
    try {
      await api.updateProduct(id, { price: pr })
      setEditingPrice(null)
      setPriceInput('')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (product_id) => {
    if (!confirm('Remove this product from the list?')) return
    setError(null)
    try {
      await api.deleteProduct(product_id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="inventory-page">
      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}

      {lowStock.length > 0 && (
        <section className="section low-stock-section">
          <h2 className="section-title">
            <span className="section-icon">⚠</span> Low stock
          </h2>
          <ul className="low-stock-list">
            {lowStock.map((p) => (
              <li key={p.product_id} className="low-stock-item">
                <span className="low-stock-name">{p.product_name}</span>
                <span className="low-stock-qty">{p.quantity} left</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Add product</h2>
        <form className="add-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="add-input"
            maxLength={255}
          />
          <input
            type="number"
            placeholder="Quantity"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="add-input add-input--narrow"
          />
          <input
            type="number"
            placeholder="Price"
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="add-input add-input--narrow"
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      </section>

      <section className="section">
        <h2 className="section-title">All products</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : products.length === 0 ? (
          <p className="muted">No products yet. Add one above.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td className="col-id">{p.product_id}</td>
                    <td className="col-name">{p.product_name}</td>
                    <td className="col-qty">
                      {editingQty === p.product_id ? (
                        <span className="qty-edit">
                          <input
                            type="number"
                            min={0}
                            value={qtyInput}
                            onChange={(e) => setQtyInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveQty()
                              if (e.key === 'Escape') cancelEditQty()
                            }}
                            className="qty-edit-input"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            onClick={saveQty}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn-ghost btn-sm"
                            onClick={cancelEditQty}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost btn-qty"
                          onClick={() => startEditQty(p)}
                        >
                          {p.quantity}
                        </button>
                      )}
                    </td>
                    <td className="col-price">
                      {editingPrice === p.product_id ? (
                        <span className="price-edit">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') savePrice()
                              if (e.key === 'Escape') cancelEditPrice()
                            }}
                            className="price-edit-input"
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            onClick={savePrice}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn-ghost btn-sm"
                            onClick={cancelEditPrice}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost btn-price"
                          onClick={() => startEditPrice(p)}
                        >
                          {formatPrice(p.price)}
                        </button>
                      )}
                    </td>
                    <td className="col-actions">
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => handleDelete(p.product_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function formatPrice(n) {
  if (n == null || isNaN(n)) return '0.00'
  return Number(n).toFixed(2)
}
