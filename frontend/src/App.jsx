import { useEffect, useState } from "react";
import { CartProvider } from "./context/CartContext";
import Login from "./pages/login";
import Signup from "./pages/singup";
import ForgotPassword from "./pages/forgot";
import EmailLogin from "./pages/email-login";
import Dashboard from "./pages/dashboard";
import AdminPanel from "./pages/admin";
import Shop from "./pages/shop";
import ProductDetails from "./pages/product";
import About from "./pages/about";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import CheckoutCallback from "./pages/checkout-callback";
import ConsultationBooking from "./pages/consultation-booking";
import ConsultationAdmin from "./pages/consultation-admin";
import Consultations from "./pages/consultations";
import TrackOrder from "./pages/track-order";
import MyAccount from "./pages/my-account";
import Layout from "./components/Layout";

const getViewFromHash = () => {
  const hash = window.location.hash || "#login";

  if (hash.startsWith("#product/")) {
    return {
      view: "product",
      productId: hash.replace("#product/", "").split("?")[0],
    };
  }

  if (hash.startsWith("#shop")) return { view: "shop" };
  if (hash.startsWith("#cart")) return { view: "cart" };
  if (hash.startsWith("#checkout-success")) return { view: "callback" };
  if (hash.startsWith("#checkout-failure")) return { view: "callback" };
  if (hash.startsWith("#checkout")) return { view: "checkout" };
  if (hash.startsWith("#consult-admin")) return { view: "consult-admin" };
  if (hash.startsWith("#consultations/")) {
    return {
      view: "consultations",
      consultationId: hash.replace("#consultations/", "").split("?")[0],
    };
  }
  if (hash.startsWith("#consultations")) return { view: "consultations" };
  if (hash.startsWith("#consult") || hash.startsWith("#new")) {
    return { view: "consult" };
  }
  if (hash.startsWith("#track")) return { view: "track" };
  if (hash.startsWith("#account")) return { view: "account" };
  if (hash.startsWith("#dashboard")) return { view: "dashboard" };
  if (hash.startsWith("#admin")) return { view: "admin" };
  if (hash.startsWith("#about")) return { view: "about" };
  if (hash.startsWith("#signup")) return { view: "signup" };
  if (hash.startsWith("#forgot")) return { view: "forgot" };
  if (hash.startsWith("#email")) return { view: "email" };
  return { view: "login" };
};

function App() {
  const [viewState, setViewState] = useState(getViewFromHash());

  useEffect(() => {
    const handleHashChange = () => setViewState(getViewFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (viewState.view === "product") {
    return (
      <CartProvider>
        <Layout>
          <ProductDetails productId={viewState.productId} />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "cart") {
    return (
      <CartProvider>
        <Layout>
          <Cart />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "checkout") {
    return (
      <CartProvider>
        <Layout>
          <Checkout />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "callback") {
    return (
      <CartProvider>
        <Layout>
          <CheckoutCallback />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "shop") {
    return (
      <CartProvider>
        <Layout>
          <Shop />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "dashboard") {
    return (
      <CartProvider>
        <Layout>
          <Dashboard />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "about") {
    return (
      <CartProvider>
        <Layout>
          <About />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "admin") {
    return (
      <CartProvider>
        <AdminPanel />
      </CartProvider>
    );
  }
  if (viewState.view === "signup") {
    return (
      <CartProvider>
        <Signup />
      </CartProvider>
    );
  }
  if (viewState.view === "forgot") {
    return (
      <CartProvider>
        <ForgotPassword />
      </CartProvider>
    );
  }
  if (viewState.view === "email") {
    return (
      <CartProvider>
        <EmailLogin />
      </CartProvider>
    );
  }
  if (viewState.view === "consult") {
    return (
      <CartProvider>
        <Layout>
          <ConsultationBooking />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "consult-admin") {
    return (
      <CartProvider>
        <ConsultationAdmin />
      </CartProvider>
    );
  }
  if (viewState.view === "track") {
    return (
      <CartProvider>
        <Layout>
          <TrackOrder />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "consultations") {
    return (
      <CartProvider>
        <Layout>
          <Consultations consultationId={viewState.consultationId} />
        </Layout>
      </CartProvider>
    );
  }
  if (viewState.view === "account") {
    return (
      <CartProvider>
        <Layout>
          <MyAccount />
        </Layout>
      </CartProvider>
    );
  }
  return (
    <CartProvider>
      <Login />
    </CartProvider>
  );
}

export default App;
