import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LuminaAuth from "./pages/LightingStoreAuth.jsx";
import Home from "./pages/Home.jsx";
import Loader from "./components/Loader.jsx";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import ProfilePage from "./pages/ProfilePage";
import AdminRoute from "./components/AdminRoute";
import AdminPage from "./pages/AdminPage"; 

const isAuth = () => !!localStorage.getItem("token");

function PublicOnly({ children }) {
  return isAuth() ? <Navigate to="/anasayfa" /> : children;
}

export default function App() {

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {

    let value = 0;

    const fake = setInterval(() => {
      value += Math.random() * 7;
      if (value >= 88) value = 88;
      setProgress(value);
    }, 120);

    const loadPage = async () => {
      await Promise.all([
        document.fonts.ready,
        new Promise(r => window.addEventListener("load", r)),
      ]);

      clearInterval(fake);

      let finish = value;
      const done = setInterval(() => {
        finish += 2;
        setProgress(finish);
        if (finish >= 100) {
          clearInterval(done);
          setTimeout(() => setReady(true), 350);
        }
      }, 18);
    };

    loadPage();

  }, []);

  if (!ready) return <Loader progress={progress} />;

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/urun/:slug" element={<ProductDetail />} />


        <Route path="/" element={<Navigate to="/anasayfa" />} />

        <Route path="/anasayfa" element={<Home />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/kategori/:slug" element={<CategoryPage />} />

        <Route path="/search" element={<SearchResults />} />

        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}/>





        <Route
          path="/login"
          element={
            <PublicOnly>
              <LuminaAuth />
            </PublicOnly>
          }
        />
        <Route path="/favorites" element={<Favorites />} />

        <Route path="*" element={<Navigate to="/anasayfa" />} />

      </Routes>
    </BrowserRouter>
  );
}
