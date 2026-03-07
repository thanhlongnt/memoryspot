import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MapIcon from "@mui/icons-material/Map";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  async function handleLogout() {
    setUserMenuAnchor(null);
    await logout();
    navigate("/login");
  }

  const currentTab = location.pathname === "/memories" ? "/memories" : "/";

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        {/* Brand */}
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 800, cursor: "pointer", mr: 2, letterSpacing: "-0.5px" }}
          onClick={() => navigate("/")}
        >
          📍 MemorySpot
        </Typography>

        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                selected={currentTab === "/"}
                onClick={() => { navigate("/"); setAnchorEl(null); }}
              >
                Map
              </MenuItem>
              <MenuItem
                selected={currentTab === "/memories"}
                onClick={() => { navigate("/memories"); setAnchorEl(null); }}
              >
                Memories
              </MenuItem>
              {user && (
                <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <>
            <Tabs
              value={currentTab}
              textColor="inherit"
              TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
              sx={{ flexGrow: 1 }}
            >
              <Tab
                label="Map"
                value="/"
                icon={<MapIcon fontSize="small" />}
                iconPosition="start"
                onClick={() => navigate("/")}
                sx={{ minHeight: 48, fontWeight: 600 }}
              />
              <Tab
                label="Memories"
                value="/memories"
                icon={<PhotoLibraryIcon fontSize="small" />}
                iconPosition="start"
                onClick={() => navigate("/memories")}
                sx={{ minHeight: 48, fontWeight: 600 }}
              />
            </Tabs>

            {user && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    src={user.profilePicture}
                    alt={user.displayName}
                    sx={{ width: 32, height: 32 }}
                    referrerPolicy="no-referrer"
                  />
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={() => setUserMenuAnchor(null)}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {user.displayName}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                </Menu>
              </Box>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
