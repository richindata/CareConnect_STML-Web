import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { navItems } from '../lib/navigation'

export function NotFoundPage() {
  return (
    <>
      <PageHeader
        title="That page isn’t here"
        documentTitle="Page not found"
        intro="Nothing is wrong and nothing has been lost. The link you followed does not point anywhere in CareConnect."
      />

      <nav aria-labelledby="not-found-heading">
        <h2 id="not-found-heading">Try one of these instead</h2>
        <ul className="card-grid">
          {navItems.map((item) => (
            <li key={item.to} className="card">
              <Link to={item.to}>
                <span aria-hidden="true">{item.icon} </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
