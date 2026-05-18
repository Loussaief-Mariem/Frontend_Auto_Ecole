import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useAuth } from "../../../context/AuthContext";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setMobileOpen(false);
  };

  const { user } = useAuth();
  const isCandidat = user?.role === "Candidat";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Topbar onToggleSidebar={!isCandidat ? handleToggleSidebar : undefined} hideToggle={isCandidat} />

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        {!isCandidat && (
          <Sidebar mobileOpen={mobileOpen} onCloseMobile={handleCloseSidebar} />
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 72px)",
            width: "100%",
          }}
        >
          <Box sx={{ 
            flex: 1, 
            px: { xs: 2, md: 3 }, 
            py: { xs: 2, md: 3 },
            maxWidth: isCandidat ? "1200px" : "none",
            width: "100%",
            margin: isCandidat ? "0 auto" : "0",
          }}>
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
