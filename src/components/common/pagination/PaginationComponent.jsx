import {
  Box,
  Select,
  MenuItem,
  Typography,
  Stack,
  Pagination,
  PaginationItem,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useState } from "react";

const PaginationComponent = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  loading = false,
  showSettings = true,
  variant = "elevation",
  elevation = 0,
}) => {
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Options de taille de page
  const pageSizeOptions = [
    { value: 5, label: "5 lignes" },
    { value: 10, label: "10 lignes" },
    { value: 25, label: "25 lignes" },
    { value: 50, label: "50 lignes" },
    { value: 100, label: "100 lignes" },
  ];

  return (
    <Paper
      variant={variant}
      elevation={elevation}
      sx={{
        borderTop: 1,
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        {/* Barre principale */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Statistiques */}
          <Stack direction="row" spacing={2} alignItems="center">
            {loading ? (
              <Skeleton variant="rectangular" width={200} height={24} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                <Box
                  component="span"
                  sx={{ fontWeight: 600, color: "primary.main" }}
                >
                  {total}
                </Box>{" "}
                élément{total > 1 ? "s" : ""}
                {total > 0 && (
                  <Box component="span" sx={{ ml: 1 }}>
                    • Affichage {startItem}-{endItem}
                  </Box>
                )}
              </Typography>
            )}

            {/* Indicateur de chargement */}
            {loading && (
              <Chip
                label="Chargement..."
                size="small"
                color="info"
                variant="outlined"
                icon={<CircularProgress size={14} />}
              />
            )}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1} alignItems="center">
            {onRefresh && (
              <Tooltip title="Actualiser">
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  disabled={loading}
                  sx={{ color: "text.secondary" }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {showSettings && (
              <Tooltip title="Paramètres d'affichage">
                <IconButton
                  size="small"
                  onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                  sx={{
                    color: showSettingsPanel
                      ? "primary.main"
                      : "text.secondary",
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Panneau de paramètres */}
        {showSettingsPanel && (
          <Box
            sx={{
              px: 2,
              pb: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
              sx={{ py: 1.5 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Lignes par page :
                </Typography>
                <Select
                  size="small"
                  value={pageSize}
                  onChange={onPageSizeChange}
                  disabled={loading}
                  sx={{ minWidth: 100 }}
                >
                  {pageSizeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", sm: "block" } }}
              />

              <Typography variant="body2" color="text.secondary">
                Page {page} / {totalPages || 1}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Pagination */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
            shape="rounded"
            size="medium"
            disabled={loading || total === 0}
            showFirstButton
            showLastButton
            renderItem={(item) => (
              <PaginationItem
                {...item}
                slots={{
                  first: FirstPageIcon,
                  last: LastPageIcon,
                  previous: NavigateBeforeIcon,
                  next: NavigateNextIcon,
                }}
                sx={{
                  transition: "all 0.2s",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    fontWeight: "bold",
                    transform: "scale(1.05)",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              />
            )}
            sx={{
              "& .MuiPagination-ul": {
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 0.5,
              },
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default PaginationComponent;
