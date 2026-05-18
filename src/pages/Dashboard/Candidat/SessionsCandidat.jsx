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
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
   useTheme ,
   Alert , CircularProgress , Grid
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useAuth } from "../../../context/AuthContext";
import { useCandidat } from "../../../hooks/useCandidat";
import { getSeancesByContrat as getSeancesCodeByContrat, retirerParticipant } from "../../../api/seanceCodeService";
import { getSeancesByContrat as getSeancesConduiteByContrat, annulerSeanceConduite } from "../../../api/seanceConduiteService";
import { format, isAfter, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const SessionsCandidat = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const { profile } = useCandidat(user?.user?.id, user?.autoEcoleId);
  console.log("autoE  coleId", user?.autoEcoleId);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState(null);

  // Tarifs (compatibles avec la partie finances)
  const TARIF_CODE = 10; // 10 DT par séance de code
  const TARIF_CONDUITE = 25; // 25 DT par heure de conduite

  // Thèmes Code (backend_auto_ecole.Models.ThemeCode)
  const themesCode = {
    0: "Signalisation",
    1: "Conducteur et Véhicule",
    2: "Arrêt et Stationnement",
    3: "Croisement et Dépassement",
    4: "Priorités",
    5: "Circulation",
    6: "Délits",
    7: "Premiers Secours",
    8: "Maintenance et Énergie",
    9: "Transport de Matières Dangereuses"
  };

  // Types de conduite (backend_auto_ecole.Models.TypeConduite)
  const typesConduite = {
    0: "Manoeuvre",
    1: "Circulation"
  };

  const [sessions, setSessions] = useState([]);

  const fetchSessions = useCallback(async () => {
    if (!profile?.contrat?.id) return;
    setLoading(true);
    try {
      const contratId = profile.contrat.id;
      const [codeRes, conduiteRes] = await Promise.all([
        getSeancesCodeByContrat(contratId),
        getSeancesConduiteByContrat(contratId)
      ]);
      
      const formattedCode = (codeRes || []).map(s => {
        const presenceInfo = s.presences?.find(p => p.contratId === contratId);
        
        let status = "Confirmée";
        if (s.estAnnulee) status = "Annulée";
        else if (isAfter(new Date(), parseISO(s.date))) status = "Effectuée";
        
        let presence = null;
        if (status === "Effectuée") {
            presence = presenceInfo?.present ? "Présent" : "Absent (Comptabilisée)";
        }
        
        const rawDate = parseISO(s.date);
        
        return {
            id: `code-${s.id}`,
            realId: s.id,
            date: format(rawDate, "dd MMMM yyyy", { locale: fr }),
            heureDebut: s.heureDebut,
            dureeMinutes: s.dureeMinutes,
            type: "Code",
            themeCode: s.theme,
            themeLabel: s.theme,
            status,
            presence,
            rawDate,
            isCancelled: s.estAnnulee,
            montant: TARIF_CODE,
            estAnnulee: s.estAnnulee
        };
      });

      const formattedConduite = (conduiteRes || []).map(s => {
        let status = "Confirmée";
        if (s.estAnnulee) status = "Annulée";
        else if (isAfter(new Date(), parseISO(s.date))) status = "Effectuée";
        
        let presence = null;
        if (status === "Effectuée") {
            presence = s.present ? "Présent" : "Absent (Comptabilisée)";
        }
        
        const rawDate = parseISO(s.date);
        
        return {
            id: `conduite-${s.id}`,
            realId: s.id,
            date: format(rawDate, "dd MMMM yyyy", { locale: fr }),
            heureDebut: s.heureDebut,
            dureeMinutes: s.dureeMinutes,
            type: "Conduite",
            typeConduite: s.typeConduite,
            typeConduiteLabel: typesConduite[s.typeConduite] || "Conduite",
            status,
            presence,
            rawDate,
            isCancelled: s.estAnnulee,
            montant: TARIF_CONDUITE,
            heures: s.dureeMinutes / 60,
            estAnnulee: s.estAnnulee
        };
      });

      const allSessions = [...formattedCode, ...formattedConduite].sort((a, b) => b.rawDate - a.rawDate);
      setSessions(allSessions);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des séances");
    } finally {
      setLoading(false);
    }
  }, [profile?.contrat?.id]);

  useEffect(() => {
    if (profile?.contrat?.id) {
      fetchSessions();
    }
  }, [profile?.contrat?.id, fetchSessions]);

  const now = new Date();
  
  // Filtrer les séances
  const upcomingSessions = sessions.filter(s => 
    !s.isCancelled && 
    (isAfter(s.rawDate, now) || format(s.rawDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) &&
    s.status !== "Effectuée"
  );
  
  const pastSessions = sessions.filter(s => 
    !s.isCancelled && 
    isAfter(now, s.rawDate) && 
    format(s.rawDate, "yyyy-MM-dd") !== format(now, "yyyy-MM-dd") &&
    s.status === "Effectuée"
  );
  
  const cancelledSessions = sessions.filter(s => s.isCancelled || s.status === "Annulée");

  // Statistiques des séances (uniquement le nombre effectué)
  const totalCodeSessions = sessions.filter(s => s.type === "Code" && !s.isCancelled && s.status === "Effectuée").length;
  const totalConduiteSessions = sessions.filter(s => s.type === "Conduite" && !s.isCancelled && s.status === "Effectuée").length;
  // Nombre de présences/absences pour le code
  const codePresentCount = sessions.filter(s => s.type === "Code" && !s.isCancelled && s.status === "Effectuée" && s.presence === "Présent").length;
  const codeAbsentCount = sessions.filter(s => s.type === "Code" && !s.isCancelled && s.status === "Effectuée" && s.presence && s.presence.includes("Absent")).length;
  
  // Nombre de présences/absences pour la conduite
  const conduitePresentCount = sessions.filter(s => s.type === "Conduite" && !s.isCancelled && s.status === "Effectuée" && s.presence === "Présent").length;
  const conduiteAbsentCount = sessions.filter(s => s.type === "Conduite" && !s.isCancelled && s.status === "Effectuée" && s.presence && s.presence.includes("Absent")).length;

  const formatDuree = (minutes) => {
    if (minutes >= 60) {
      const heures = minutes / 60;
      return `${heures}h`;
    }
    return `${minutes}min`;
  };

  const handleOpenCancelDialog = (session) => {
    setSessionToCancel(session);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!sessionToCancel || !profile) return;
    setCancellingId(sessionToCancel.id);
    
    try {
      if (sessionToCancel.type === "Code") {
        await retirerParticipant(sessionToCancel.realId, profile.id);
      } else {
        await annulerSeanceConduite(sessionToCancel.realId);
      }
      
      await fetchSessions();
      setCancelDialogOpen(false);
      setSessionToCancel(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'annulation de la séance");
    } finally {
      setCancellingId(null);
    }
  };

  const SessionCard = ({ id, date, heureDebut, dureeMinutes, type, themeLabel, typeConduiteLabel, status, presence, canCancel, onCancel, isCancelling, montant, rawSession }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        transition: "0.2s",
        "&:hover": { 
          borderColor: "primary.main", 
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)" 
        },
        width: "100%"
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%", flex: 1 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: type === "Code" ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.secondary.main, 0.08),
              color: type === "Code" ? "primary.main" : "secondary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
            }}
          >
            <CalendarMonthOutlinedIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={800} variant="body1">{date}</Typography>
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <AccessTimeOutlinedIcon fontSize="inherit" />
              {heureDebut} - Durée: {formatDuree(dureeMinutes || 60)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "row", sm: "column" }} spacing={1} alignItems={{ xs: "center", sm: "flex-end" }} justifyContent="space-between" sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Chip
            label={`${type}${type === "Code" ? ` · ${themeLabel || ""}` : ` · ${typeConduiteLabel || ""}`}`}
            size="small"
            color={type === "Code" ? "primary" : "secondary"}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          />
          {montant && (
            <Typography variant="body2" fontWeight={800} color="primary.main" mt={{ sm: 0.5 }}>
              {montant} DT
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ width: { xs: "100%", sm: "auto" }, mt: { xs: 1.5, sm: 0 } }}>
          {status === "Effectuée" && presence && (
            <Chip
              label={presence}
              color={presence.includes("Présent") ? "success" : "warning"}
              size="small"
              sx={{ fontWeight: 600, borderRadius: 2 }}
            />
          )}
          {status !== "Confirmée" && status !== "Effectuée" && (
            <Chip
              label={status}
              color={status === "Annulée" ? "error" : "default"}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600, borderRadius: 2 }}
            />
          )}
          {status === "Confirmée" && (
            <Chip
              label="À venir"
              color="info"
              size="small"
              sx={{ fontWeight: 600, borderRadius: 2 }}
            />
          )}
          {canCancel && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onCancel(rawSession)}
              disabled={isCancelling}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, minWidth: 90 }}
            >
              {isCancelling ? <CircularProgress size={16} color="inherit" /> : "Annuler"}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
      {/* Header & Stats in Column Stack */}
      <Stack direction="column" spacing={3} mb={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={800}>
            Mes Séances
          </Typography>
        </Stack>

        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: "1px solid", 
            borderColor: "divider",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            bgcolor: "background.paper",
            width: "100%"
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  Heures de code effectuées
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                  {totalCodeSessions} h
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={`Présent: ${codePresentCount}`} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                  <Chip label={`Absent: ${codeAbsentCount}`} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
                </Stack>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  Heures Conduite effectuées
                </Typography>
                <Typography variant="h5" fontWeight={800} color="secondary.main">
                  {totalConduiteSessions} h
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip label={`Présent: ${conduitePresentCount}`} size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
                  <Chip label={`Absent: ${conduiteAbsentCount}`} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 4, mb: 4, overflow: "hidden", border: "1px solid", borderColor: "divider", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
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
              fontWeight: 700,
              fontSize: 15,
              minHeight: 48,
            },
          }}
        >
          <Tab label={`À venir (${upcomingSessions.length})`} />
          <Tab label={`Historique (${pastSessions.length})`} />
          <Tab label={`Annulées (${cancelledSessions.length})`} />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 ? (
            upcomingSessions.length > 0 ? (
              upcomingSessions.map((s) => (
                <SessionCard
                  key={`${s.type}-${s.id}`}
                  {...s}
                  rawSession={s}
                  canCancel={s.status === "Confirmée"}
                  onCancel={handleOpenCancelDialog}
                  isCancelling={cancellingId === s.id}
                />
              ))
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4} fontWeight={500}>
                Aucune séance à venir.
              </Typography>
            )
          ) : tab === 1 ? (
            pastSessions.length > 0 ? (
              pastSessions.map((s) => (
                <SessionCard
                  key={`${s.type}-${s.id}`}
                  {...s}
                  canCancel={false}
                />
              ))
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4} fontWeight={500}>
                Aucun historique de séance.
              </Typography>
            )
          ) : (
            cancelledSessions.length > 0 ? (
              cancelledSessions.map((s) => (
                <SessionCard
                  key={`${s.type}-${s.id}`}
                  {...s}
                  canCancel={false}
                />
              ))
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4} fontWeight={500}>
                Aucune séance annulée.
              </Typography>
            )
          )}
        </Box>
      </Paper>

      {/* Dialogue de confirmation d'annulation */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => !cancellingId && setCancelDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, width: "100%", maxWidth: 450, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>
          Confirmer l'annulation
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Êtes-vous sûr de vouloir annuler votre séance de <strong>{sessionToCancel?.type}</strong> prévue le <strong>{sessionToCancel?.date}</strong> à <strong>{sessionToCancel?.heureDebut}</strong> ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setCancelDialogOpen(false)} 
            disabled={cancellingId}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Retour
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            variant="contained" 
            color="error"
            disabled={cancellingId}
            sx={{ 
              textTransform: "none", 
              fontWeight: 700, 
              borderRadius: 2,
              minWidth: 120
            }}
          >
            {cancellingId ? <CircularProgress size={20} color="inherit" /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionsCandidat;