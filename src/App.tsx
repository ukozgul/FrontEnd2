import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/layout"
import DashboardPage from "./pages/dashboard/page"
import VehiclesPage from "./pages/vehicle/VehiclesPage"
import DenemePage from "./pages/deneme/page"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/araclar" element={<VehiclesPage />} />
          <Route path="/deneme" element={<DenemePage />}></Route>
          {/* diğer sayfaları buraya ekle */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}