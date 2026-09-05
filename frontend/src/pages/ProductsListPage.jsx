import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertMessage } from '../components/AlertMessage';

export function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Encapsulated fetch inside useEffect to prevent infinite loops
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await api.getProducts(search, category);
        if (isMounted) {
          setProducts(data || []);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al obtener la lista de productos.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, category]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Está seguro de eliminar el producto "${name}"?`)) {
      return;
    }

    try {
      await api.deleteProduct(id);
      setSuccessMsg(`El producto "${name}" fue eliminado correctamente.`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar el producto.');
    }
  };

  return (
    <div>
      {/* Header section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0">Inventario de productos</h2>
          <p className="text-muted small m-0">Catálogo general de útiles y materiales de papelería</p>
        </div>
        <Link to="/productos/nuevo" className="btn btn-primary fw-bold">
          <i className="bi bi-plus-lg me-1"></i> Agregar producto
        </Link>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Filters bar */}
      <div className="table-panel mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Buscar por nombre, código SKU o marca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-5">
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="books">Cuadernos y Papelería</option>
              <option value="pencils">Escritura y Colores</option>
              <option value="paint">Arte y Manualidades</option>
              <option value="geometry">Reglas y Geometría</option>
              <option value="glues">Pegamentos y Tijeras</option>
              <option value="bags">Mochilas y Estuches</option>
              <option value="others">Otros útiles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="table-panel">
        {loading ? (
          <LoadingSpinner message="Cargando productos..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-ideas align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código / SKU</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Marca</th>
                  <th>Stock</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <strong className="text-dark d-block">{prod.name}</strong>
                        {prod.description && (
                          <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '260px' }}>
                            {prod.description}
                          </small>
                        )}
                      </td>
                      <td>{prod.sku || '-'}</td>
                      <td className="fw-bold">{Number(prod.price).toFixed(2)} Bs.</td>
                      <td>{prod.categoryLabel || prod.category}</td>
                      <td>{prod.brand || '-'}</td>
                      <td>
                        <span className="me-2">{prod.stock} u.</span>
                        <span className={`badge-status ${prod.stockStatusClass || 'ok'}`}>
                          {prod.stockStatus || 'Disponible'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/productos/editar/${prod.id}`}
                            className="btn btn-outline-primary"
                            title="Editar producto"
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </Link>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="btn btn-outline-danger"
                            title="Eliminar producto"
                          >
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">
                      No se encontraron productos en el inventario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
