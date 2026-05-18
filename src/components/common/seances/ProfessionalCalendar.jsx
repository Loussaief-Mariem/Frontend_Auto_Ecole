import React, { useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { fr } from "date-fns/locale";
import { Box, Paper, Typography, Chip } from "@mui/material";

// Set up localizer for react-big-calendar
const locales = {
  "fr": fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const ProfessionalCalendar = ({ seances, onSelectEvent }) => {
  
  // Mappage des séances vers le format attendu par react-big-calendar
  const events = useMemo(() => {
    if (!seances) return [];
    
    return seances.map(seance => {
      // Construction de la date de début
      const dateOnly = seance.date.split('T')[0]; // ex: "2026-05-18"
      let hours = 0;
      let minutes = 0;
      
      if (typeof seance.heureDebut === "string") {
        const timeParts = seance.heureDebut.split(':');
        hours = parseInt(timeParts[0] || 0);
        minutes = parseInt(timeParts[1] || 0);
      } else if (seance.heureDebut && typeof seance.heureDebut === "object") {
        hours = seance.heureDebut.hours || 0;
        minutes = seance.heureDebut.minutes || 0;
      }

      const start = new Date(dateOnly);
      start.setHours(hours, minutes, 0, 0);

      const end = new Date(start.getTime() + (seance.dureeMinutes || 60) * 60000);

      // Titre
      let title = "";
      if (seance.globalType === "code") {
        title = `📚 Code (${seance.capaciteMax || 20} places)`;
      } else {
        const typeCond = seance.typeConduite === 0 ? "Normale" : 
                         seance.typeConduite === 1 ? "Accompagnée" :
                         seance.typeConduite === 2 ? "Supervisée" : "Simulateur";
        title = `🚗 Conduite - ${seance.candidatNom || "N/A"}`;
      }

      if (seance.estAnnulee) {
        title = `❌ ANNULÉE - ${title}`;
      }

      return {
        id: seance.id,
        title,
        start,
        end,
        resource: seance,
        globalType: seance.globalType,
        isCancelled: seance.estAnnulee,
      };
    });
  }, [seances]);

  // Style des événements
  const eventStyleGetter = (event) => {
    let backgroundColor = "#1976d2"; // Bleu par défaut (Code)
    
    if (event.isCancelled) {
      backgroundColor = "#d32f2f"; // Rouge pour annulé
    } else if (event.globalType === "conduite") {
      backgroundColor = "#9c27b0"; // Violet pour conduite
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        padding: '2px 5px',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
      }
    };
  };

  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: "Aucun événement dans cette période.",
    showMore: total => `+ ${total} événement(s) supplémentaire(s)`
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        height: '75vh',
        minHeight: '600px',
        "& .rbc-calendar": {
          fontFamily: "'Inter', sans-serif",
        },
        "& .rbc-toolbar": {
          mb: 2,
        },
        "& .rbc-toolbar button": {
          borderRadius: '8px',
        },
        "& .rbc-toolbar button.rbc-active": {
          backgroundColor: "#e2e8f0",
          boxShadow: 'none'
        },
        "& .rbc-event": {
          transition: 'transform 0.1s',
        },
        "& .rbc-event:hover": {
          transform: 'scale(1.02)'
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Planning des Séances
        </Typography>
        <Box display="flex" gap={1}>
          <Chip label="Code" size="small" sx={{ bgcolor: '#1976d2', color: 'white' }} />
          <Chip label="Conduite" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
          <Chip label="Annulée" size="small" sx={{ bgcolor: '#d32f2f', color: 'white' }} />
        </Box>
      </Box>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 50px)' }}
        messages={messages}
        culture="fr"
        defaultView={Views.WEEK}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => onSelectEvent && onSelectEvent(event.resource)}
        min={new Date(0, 0, 0, 7, 0, 0)} // Démarre à 7h00
        max={new Date(0, 0, 0, 22, 0, 0)} // Finit à 22h00
      />
    </Paper>
  );
};

export default ProfessionalCalendar;
