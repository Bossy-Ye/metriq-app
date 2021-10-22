import { Navbar } from 'react-bootstrap'
import MainNav from './MainNav'
import logo from './../metriq_logo_primary_blue.png'

const MainNavbar = (props) => {
  return (
    <div>
      <Navbar bg='light' expand='lg'>
        <Navbar.Brand href='/' className='metriq-navbar'>
          <img src={logo} alt='logo' className='logo-image' />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <MainNav isLoggedIn={props.isLoggedIn} />
        </Navbar.Collapse>
      </Navbar>
      <div className='bg-light metriq-navbar'>
        <h1>Quantum Computing Benchmarks</h1>
        <h5>by community contributors</h5>
        <br />
      </div>
    </div>
  )
}

export default MainNavbar
