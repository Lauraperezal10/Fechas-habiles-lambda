import express, { Request, Response } from 'express';
import { DateTime } from 'luxon';
import axios from 'axios';

const app = express();
app.use(express.json());

let diasFestivos: string[] = [];
const diasHabiles: string[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];

async function obtenerDiasFestivos(){
  const url = 'https://content.capta.co/Recruitment/WorkingDays.json';
  const response = await axios.get<string[]>(url);
  diasFestivos = response.data
}

function sumarDiasHabiles(fecha: DateTime, days: number): DateTime {
  let fechaTemp: DateTime = fecha;
  let diasSumados: number = 0;

  while (diasSumados < days) {
    fechaTemp = fechaTemp.plus({ days: 1 });
    const fechaCompareFestivo: string = fechaTemp.toFormat('yyyy-MM-dd');
    const dia: string = fechaTemp.toFormat('cccc').toLowerCase();

    if (diasHabiles.includes(dia) && !diasFestivos.includes(fechaCompareFestivo)) {
      diasSumados++;
    }
  }

  return fechaTemp;
}

app.get(
  '/conteoDiasHabiles',
  async (
    req: Request<{}, {}, {}, { days?: string; hours?: string; date?: string }>,
    res: Response
  ): Promise<void> => {

    const days: number = parseInt(req.query.days ?? '0', 10);
    const hours: number = parseInt(req.query.hours ?? '0', 10);
    const date: string | undefined = req.query.date;

    let fechaInicio: DateTime = DateTime.now().setZone('America/Bogota');

    if (date) {
      const fechaUTC: DateTime = DateTime.fromISO(date, { zone: 'utc' });

      if (!fechaUTC.isValid) {
        res.status(400).json({
          error: 'Formato de fecha inválido. Debe ser ISO 8601 válido en UTC.',
        });
        return;
      }

      fechaInicio = fechaUTC.setZone('America/Bogota');
    }

    await obtenerDiasFestivos();

    const hourPlusMinutes: number =
      fechaInicio.hour + fechaInicio.minute / 60;

    const diaActual: string = fechaInicio.toFormat('cccc').toLowerCase();
    const fechaActualFormat: string = fechaInicio.toFormat('yyyy-MM-dd');

    if (
      fechaInicio.hour < 8 ||
      (hourPlusMinutes > 17 &&
        (diasFestivos.includes(fechaActualFormat) ||
          !diasHabiles.includes(diaActual))) ||
      diasFestivos.includes(fechaActualFormat) ||
      !diasHabiles.includes(diaActual)
    ) {
      do {
        fechaInicio = fechaInicio.minus({ days: 1 });
      } while (
        diasFestivos.includes(
          fechaInicio.toFormat('yyyy-MM-dd')
        ) || !diasHabiles.includes(fechaInicio.toFormat('cccc').toLowerCase())
      );

      fechaInicio = fechaInicio.set({ hour: 17, minute: 0, second: 0 });
    } else if (hourPlusMinutes > 17) {
      fechaInicio = fechaInicio.set({ hour: 17, minute: 0, second: 0 });
    }

    let fechaBaseResponse: DateTime = fechaInicio;

    if (fechaBaseResponse.hour >= 17 && days === 0) {
      do {
        fechaBaseResponse = fechaBaseResponse.plus({ days: 1 });
      } while (
        diasFestivos.includes(
          fechaBaseResponse.toFormat('yyyy-MM-dd')
        ) ||
        !diasHabiles.includes(fechaBaseResponse.toFormat('cccc').toLowerCase())
      );

      fechaBaseResponse = fechaBaseResponse.set({
        hour: 8,
        minute: 0,
        second: 0,
      });
    }

    const responseHourPlusMinutes: number =
      fechaBaseResponse.hour + fechaBaseResponse.minute / 60;

    if (responseHourPlusMinutes > 12 && responseHourPlusMinutes < 13) {
      fechaBaseResponse = fechaBaseResponse.set({
        hour: 12,
        minute: 0,
        second: 0,
      });
    }

    fechaBaseResponse = sumarDiasHabiles(fechaBaseResponse, days);

    if (hours && hours > 0) {
      fechaBaseResponse = fechaBaseResponse.plus({ hours });

      let whileCiclo: boolean = true;

      do {
        whileCiclo = false;

        const pasoDia: boolean =
          fechaBaseResponse.equals(
            fechaBaseResponse.plus({ days: 1 })
          ) && fechaBaseResponse.hour < 8;

        if (pasoDia) {
          const pasoDiaHours: number = 7 + (8 - fechaBaseResponse.hour);
          fechaBaseResponse = fechaBaseResponse.set({
            hour: 8,
            minute: 0,
            second: 0,
          });
          fechaBaseResponse = fechaBaseResponse.plus({
            hours: pasoDiaHours,
          });
        }

        const hourResponsePlusMinutes: number =
          fechaBaseResponse.hour + fechaBaseResponse.minute / 60;

        if (hourResponsePlusMinutes > 17) {
          const differenceHours: number = fechaBaseResponse.hour - 17;
          fechaBaseResponse = fechaBaseResponse.plus({ days: 1 });
          fechaBaseResponse = fechaBaseResponse.set({
            hour: 8,
            minute: 0,
            second: 0,
          });
          fechaBaseResponse = fechaBaseResponse.plus({
            hours: differenceHours,
          });
          whileCiclo = true;
        } else if (fechaBaseResponse.hour < 8) {
          fechaBaseResponse = fechaBaseResponse.minus({ days: 1 });
          fechaBaseResponse = fechaBaseResponse.set({
            hour: 17,
            minute: 0,
            second: 0,
          });
          whileCiclo = true;
        } else if (
          hourResponsePlusMinutes > 12 &&
          hourResponsePlusMinutes < 13
        ) {
          fechaBaseResponse = fechaBaseResponse.set({
            hour: 12,
            minute: 0,
            second: 0,
          });
          whileCiclo = true;
        }
      } while (whileCiclo);

      if (fechaBaseResponse.hour >= 13) {
        fechaBaseResponse = fechaBaseResponse.plus({ hours: 1 });
      }
    }

    res.status(200).send({ date: fechaBaseResponse.toUTC().toISO() });
  }
);

export default app;
