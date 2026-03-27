import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Topbar onToggleSidebar={handleToggleSidebar} />

      <Box sx={{ display: "flex" }}>
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={handleCloseSidebar} />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 72px)",
          }}
        >
          <Box sx={{ flex: 1, px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
