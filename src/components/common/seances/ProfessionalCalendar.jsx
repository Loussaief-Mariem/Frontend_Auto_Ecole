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
    let backgroundColor = "#eff6ff"; 
    let color = "#1d4ed8";
    let borderLeft = "4px solid #3b82f6";
    let border = "1px solid #dbeafe";
    
    if (event.isCancelled) {
      backgroundColor = "#fff1f2";
      color = "#be123c";
      borderLeft = "4px solid #f43f5e";
      border = "1px solid #ffe4e6";
    } else if (event.globalType === "conduite") {
      backgroundColor = "#faf5ff";
      color = "#7e22ce";
      borderLeft = "4px solid #a855f7";
      border = "1px solid #f3e8ff";
    }

    return {
      style: {
        backgroundColor,
        color,
        borderLeft,
        borderTop: border,
        borderBottom: border,
        borderRight: border,
        borderRadius: '8px',
        opacity: 0.95,
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: '600',
        padding: '6px 10px',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.03)',
        height: '100%'
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
        height: '78vh',
        minHeight: '650px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        "& .rbc-calendar": {
          fontFamily: "'Outfit', 'Inter', sans-serif",
        },
        "& .rbc-toolbar": {
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        },
        "& .rbc-toolbar-label": {
          fontWeight: 800,
          fontSize: '1.25rem',
          color: 'text.primary',
        },
        "& .rbc-toolbar button": {
          borderRadius: '10px',
          border: '1px solid',
          borderColor: 'divider',
          padding: '6px 16px',
          fontWeight: '600',
          textTransform: 'none',
          color: 'text.secondary',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            color: 'text.primary',
          }
        },
        "& .rbc-toolbar button.rbc-active": {
          backgroundColor: 'primary.main',
          color: 'white',
          borderColor: 'primary.main',
          boxShadow: '0 4px 6px -1px rgba(25, 118, 210, 0.2)',
          '&:hover': {
            backgroundColor: 'primary.dark',
            color: 'white',
          }
        },
        "& .rbc-header": {
          padding: '12px',
          fontWeight: '700',
          color: 'text.secondary',
          borderBottomWidth: '2px',
        },
        "& .rbc-header.rbc-today": {
          color: 'primary.main',
          fontWeight: '800',
          backgroundColor: '#eff6ff',
        },
        "& .rbc-time-content": {
          borderTop: '2px solid',
          borderColor: 'divider',
        },
        "& .rbc-time-gutter .rbc-timeslot-group": {
          borderBottom: '1px solid',
          borderColor: 'divider',
          pr: 1.5,
        },
        "& .rbc-timeslot-group": {
          minHeight: '60px',
        },
        "& .rbc-day-slot .rbc-time-slot": {
          borderTop: '1px dashed #f1f5f9',
        },
        "& .rbc-event": {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: 0,
        },
        "& .rbc-event:hover": {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 10,
        },
        "& .rbc-today": {
          backgroundColor: '#f8fafc',
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Planning des Séances
        </Typography>
        <Box display="flex" gap={1}>
          <Chip label="Code" size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', borderLeft: '3px solid #3b82f6', fontWeight: 'bold' }} />
          <Chip label="Conduite" size="small" sx={{ bgcolor: '#faf5ff', color: '#7e22ce', borderLeft: '3px solid #a855f7', fontWeight: 'bold' }} />
          <Chip label="Annulée" size="small" sx={{ bgcolor: '#fff1f2', color: '#be123c', borderLeft: '3px solid #f43f5e', fontWeight: 'bold' }} />
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
