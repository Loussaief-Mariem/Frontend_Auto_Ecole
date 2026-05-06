import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useAuth } from "../../../context/AuthContext";
import { getSeancesByContrat as getSeancesCodeByContrat, retirerParticipant } from "../../../api/seanceCodeService";
import { getSeancesByContrat as getSeancesConduiteByContrat, annulerSeanceConduite } from "../../../api/seanceConduiteService";
import { format, isAfter, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const SessionCard = ({ id, date, time, type, status, canCancel, onCancel, isCancelling }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      mb: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      "&:hover": { borderColor: "primary.main", transition: "0.3s" },
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={3} alignItems="center">
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: type === "Code" ? "primary.light" : "secondary.light",
            color: type === "Code" ? "primary.main" : "secondary.main",
            display: "flex",
            alignItems: "center",
          }}
        >
          <CalendarMonthOutlinedIcon />
        </Box>
        <Box>
          <Typography fontWeight={700}>{date}</Typography>
          <Typography variant="body2" color="text.secondary">
            <AccessTimeOutlinedIcon
              fontSize="inherit"
              sx={{ verticalAlign: "middle", mr: 0.5 }}
            />
            {time}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Type de séance
          </Typography>
          <Chip
            label={type}
            size="small"
            color={type === "Code" ? "primary" : "secondary"}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        {status !== "Confirmé" && (
          <Chip
            label={status}
            color={status === "Effectué" ? "success" : status === "Annulée" ? "error" : "default"}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        )}
        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onCancel(id, type)}
            disabled={isCancelling}
            sx={{ borderRadius: 2, textTransform: "none", minWidth: 90 }}
          >
            {isCancelling ? <CircularProgress size={16} color="inherit" /> : "Annuler"}
          </Button>
        )}
      </Stack>
    </Stack>
  </Paper>
);

const SessionsCandidat = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const contratId = user?.contratId || user?.user?.contratId;

  const loadSessions = useCallback(async () => {
    if (!contratId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [codeRes, conduiteRes] = await Promise.all([
        getSeancesCodeByContrat(contratId),
        getSeancesConduiteByContrat(contratId)
      ]);

      const codeSessions = (codeRes.data || codeRes).map(s => ({
        id: s.id,
        date: s.date,
        time: s.heureDebut?.substring(0, 5),
        type: "Code",
        status: s.estAnnulee ? "Annulée" : (isAfter(new Date(), parseISO(s.date)) ? "Effectué" : "Confirmé"),
        rawDate: parseISO(s.date),
        isCancelled: s.estAnnulee
      }));

      const conduiteSessions = (conduiteRes.data || conduiteRes).map(s => {
        const typeConduiteLabel = s.typeConduite === 0 ? "Manoeuvre" : (s.typeConduite === 1 ? "Parking" : "");
        return {
          id: s.id,
          date: s.date,
          time: s.heureDebut?.substring(0, 5),
          type: `Conduite ${typeConduiteLabel ? `(${typeConduiteLabel})` : ""}`,
          status: s.estAnnulee ? "Annulée" : (isAfter(new Date(), parseISO(s.date)) ? "Effectué" : "Confirmé"),
          rawDate: parseISO(s.date),
          isCancelled: s.estAnnulee
        };
      });

      const allSessions = [...codeSessions, ...conduiteSessions].sort((a, b) => b.rawDate - a.rawDate);
      setSessions(allSessions);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setError("Erreur lors du chargement des séances.");
    } finally {
      setLoading(false);
    }
  }, [contratId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCancelSession = async (id, type) => {

    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette séance ?")) return;

    setCancellingId(id);
    try {
      if (type === "Code") {
        console.log(id, user?.user?.id || user?.id);
        console.log("retirer participant louding ");
        // Pour le code, on retire le participant (contrat) de la séance
        await retirerParticipant(id, user?.user?.id || user?.id);
      } else {
        // Pour la conduite, on annule la séance (car elle est individuelle au contrat)
        await annulerSeanceConduite(id);
      }
      await loadSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'annulation.");
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcomingSessions = sessions.filter(s => !s.isCancelled && (isAfter(s.rawDate, now) || format(s.rawDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")));
  const pastSessions = sessions.filter(s => !s.isCancelled && isAfter(now, s.rawDate) && format(s.rawDate, "yyyy-MM-dd") !== format(now, "yyyy-MM-dd"));
  const cancelledSessions = sessions.filter(s => s.isCancelled);

  if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={4}>
        Mes Séances
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 4, mb: 4, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            px: 2,
            pt: 2,
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: 15,
              minHeight: 48,
            },
          }}
        >
          <Tab label="À venir" />
          <Tab label="Historique" />
          <Tab label="Annulées" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 ? (
            upcomingSessions.length > 0 ? (
              upcomingSessions.map((s) => (
                <SessionCard
                  key={`${s.type}-${s.id}`}
                  {...s}
                  date={format(s.rawDate, "dd MMMM yyyy", { locale: fr })}
                  canCancel={true}
                  onCancel={handleCancelSession}
                  isCancelling={cancellingId === s.id}
                />
              ))
            ) : (
              <Typography color="text.secondary">Aucune séance à venir.</Typography>
            )
          ) : tab === 1 ? (
            pastSessions.length > 0 ? (
              pastSessions.map((s) => (
                <SessionCard
                  key={`${s.type}-${s.id}`}
                  {...s}
                  date={format(s.rawDate, "dd MMMM yyyy", { locale: fr })}
                  canCancel={false}
                />
              ))
            ) : (
              <Typography color="text.secondary">Aucun historique de séance.</Typography>
            )
          ) : (
            cancelledSessions.length > 0 ? (
              cancelledSessions.map((s) => (
                <SessionCard
                  key={`${s.type}-${s.id}`}
                  {...s}
                  date={format(s.rawDate, "dd MMMM yyyy", { locale: fr })}
                  canCancel={false}
                />
              ))
            ) : (
              <Typography color="text.secondary">Aucune séance annulée.</Typography>
            )
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SessionsCandidat;
