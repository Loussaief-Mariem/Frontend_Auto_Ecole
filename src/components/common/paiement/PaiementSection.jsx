// src/components/common/paiement/PaiementSection.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import usePaiement from "../../../hooks/usePaiement";

const PaiementSection = ({ contratId }) => {
  const { historique, situation, addPaiement, loading } =
    usePaiement(contratId);

  const [form, setForm] = useState({
    montant: "",
    description: "",
    type: 0,
    contratId: contratId,
  });

  const handleSubmit = async () => {
    if (!form.montant) return;

    await addPaiement({
      ...form,
      montant: parseFloat(form.montant),
    });

    setForm({ ...form, montant: "", description: "" });
  };

  return (
    <Box>
      {/* SITUATION */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: "#1976d2", color: "white" }}>
            <CardContent>
              <Typography>Total</Typography>
              <Typography variant="h5">{situation?.total ?? 0} DT</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{ bgcolor: "#4caf50", color: "white" }}>
            <CardContent>
              <Typography>Payé</Typography>
              <Typography variant="h5">
                {situation?.totalPaye ?? 0} DT
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{ bgcolor: "#ff9800", color: "white" }}>
            <CardContent>
              <Typography>Reste</Typography>
              <Typography variant="h5">{situation?.reste ?? 0} DT</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FORM PAIEMENT */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ajouter paiement
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Montant"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
              type="number"
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              Payer
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* HISTORIQUE */}
      <Card>
        <CardContent>
          <Typography variant="h6">Historique</Typography>
          <Divider sx={{ my: 2 }} />

          {historique.map((p) => (
            <Box key={p.id} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>{p.numeroRecu}</Typography>
                <Chip label={`${p.montant} DT`} color="primary" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {new Date(p.datePaiement).toLocaleString()}
              </Typography>
              <Divider sx={{ mt: 1 }} />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaiementSection;
