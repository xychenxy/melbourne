import { Alert, Button, Box, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useDeleteBuildingMutation, useGetBuildingsQuery } from "../../redux/services/buildingsApi";
import BuildingCard from "./BuildingCard";
import BuildingDialog from "./building-dialog/BuildingDialog";
import ConfirmDialog from "../../components/ConfirmDialog";

function BuildingsListPage() {
  const { data, isLoading, isError } = useGetBuildingsQuery();
  const [deleteBuilding] = useDeleteBuildingMutation();
  const buildings = useMemo(() => data ?? [], [data]);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const stateNameById = new Map([
    ["NSW", "NSW"],
    ["VIC", "VIC"],
    ["QLD", "QLD"],
    ["SA", "SA"],
    ["ACT", "ACT"],
    ["WA", "WA"],
  ]);
  const filteredBuildings = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return buildings;
    return buildings.filter((building) => {
      const address = [building.streetAddress1, building.streetAddress2, building.suburb, building.stateId, building.postcode].filter(Boolean).join(" ");
      return [building.name, building.code, address].some((value) => value?.toLowerCase().includes(keyword));
    });
  }, [buildings, searchValue]);
  const groupedBuildings = filteredBuildings.reduce<Record<string, typeof buildings>>((acc, building) => {
    const key = building.stateId || "UNKNOWN";
    if (!acc[key]) acc[key] = [];
    acc[key].push(building);
    return acc;
  }, {});
  const orderedStateIds = ["NSW", "VIC", "QLD", "SA", "ACT", "WA"];
  const remainingStateIds = Object.keys(groupedBuildings).filter((stateId) => !orderedStateIds.includes(stateId));
  const stateIdsToRender = [...orderedStateIds, ...remainingStateIds];
  const stateSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<(typeof buildings)[number] | null>(null);

  const handleJumpToState = (stateId: string) => {
    const target = stateSectionRefs.current[stateId];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCreate = () => {
    setDialogMode("create");
    setActiveBuildingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (building: (typeof buildings)[number]) => {
    setDialogMode("edit");
    setActiveBuildingId(building.id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleViewDetails = (building: (typeof buildings)[number]) => {
    const floors = [...(building.floors ?? [])].sort((a, b) => a.number - b.number);
    const targetFloor = floors[0];
    if (!targetFloor) return;
    navigate(`/buildings/${building.id}/floors/${targetFloor.id}/map`);
  };

  const handleDelete = (building: (typeof buildings)[number]) => {
    setPendingDelete(building);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBuilding(pendingDelete.id).unwrap();
    } catch (error) {
      console.error("Failed to delete building.", error);
    } finally {
      setPendingDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  return (
    <Stack spacing={2} sx={{ height: "calc(100vh - 88px)", minHeight: 0, overflow: "hidden" }}>
      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: { xs: "stretch", md: "center" },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ minWidth: 180, flexShrink: 0, display: { xs: "none", md: "block" } }} />
          <TextField
            size="small"
            placeholder="Search buildings"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchValue ? (
                <InputAdornment position="end">
                  <IconButton aria-label="clear search" edge="end" size="small" onClick={() => setSearchValue("")}>
                    ×
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <Button variant="contained" sx={{ alignSelf: { xs: "flex-start", md: "center" } }} onClick={handleCreate}>
            Create a Building
          </Button>
        </Box>
      </Stack>
      {isError ? (
        <Alert severity="error">Failed to load buildings. Please try again.</Alert>
      ) : isLoading && buildings.length === 0 ? (
        <Typography color="text.secondary">Loading buildings...</Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 4,
            alignItems: "flex-start",
            flex: 1,
            minHeight: 0,
            height: "100%",
          }}
        >
          <Stack spacing={1} sx={{ minWidth: 180, flexShrink: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              States
            </Typography>
            {stateIdsToRender.map((stateId) => {
              const stateBuildings = groupedBuildings[stateId] ?? [];
              if (stateBuildings.length === 0) return null;
              const stateName = stateNameById.get(stateId) ?? stateId;
              return (
                <Button key={stateId} size="small" variant="text" sx={{ justifyContent: "flex-start" }} onClick={() => handleJumpToState(stateId)}>
                  {stateName}
                </Button>
              );
            })}
          </Stack>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              height: "100%",
              overflowY: "auto",
              pr: 2,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.3) transparent",
              "&::-webkit-scrollbar": {
                width: 6,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: 999,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Stack spacing={4} sx={{ pt: 2, pb: 7 }}>
              {stateIdsToRender.map((stateId) => {
                const stateBuildings = groupedBuildings[stateId] ?? [];
                if (stateBuildings.length === 0) return null;
                const stateName = stateNameById.get(stateId) ?? stateId;
                return (
                  <Stack
                    key={stateId}
                    spacing={1.5}
                    ref={(node) => {
                      stateSectionRefs.current[stateId] = node;
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {stateName}
                    </Typography>
                    <Grid container spacing={5} justifyContent="flex-start">
                      {stateBuildings.map((building) => (
                        <Grid key={building.id} size={{ xs: 12, md: 6, lg: 4 }}>
                        <BuildingCard building={building} onEdit={handleEdit} onDelete={handleDelete} onViewDetails={handleViewDetails} />
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                );
              })}
              {!isLoading && filteredBuildings.length === 0 ? <Typography color="text.secondary">{searchValue ? "No results match your search." : "No buildings found."}</Typography> : null}
            </Stack>
          </Box>
        </Box>
      )}
      <BuildingDialog open={dialogOpen} mode={dialogMode} buildingId={activeBuildingId} onClose={handleCloseDialog} />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete building"
        description={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Stack>
  );
}

export default BuildingsListPage;
