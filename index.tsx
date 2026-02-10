function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split("/")[2] || "agents";

  const handleTabChange = (_event: React.SyntheticEvent, value: string) => {
    navigate(value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Agents" value="agents" />
      </Tabs>
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default SettingsPage;


===

import { Box, Typography } from "@mui/material";

function SettingsAgentsTab() {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600}>
        Agents
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Configure agents here.
      </Typography>
    </Box>
  );
}

export default SettingsAgentsTab;

====

      {
        path: "settings",
        element: <SettingsPage />,
        children: [
          { index: true, element: <Navigate to="agents" replace /> },
          { path: "agents", element: <SettingsAgentsTab /> },
        ],
      },
          
