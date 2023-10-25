const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3002;
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Hace el Scrapping al Banco Central de Venezuela - DOLLAR Y EURO */
app.get('/dollar-bcv', (req, res) => {
    axios.get(`https://www.bcv.org.ve/`).then((response) => {

        const html = response.data;

        const $ = cheerio.load(html);

        let euro = "";
        let data = [];

        /* Para convertir de USD a BS.D */
        $('div', '.view-content').each((index, element) => {
            euro = ($(element).find('div.row.recuadrotsmc').text().trim());
            // console.log('EUR: ', euro);
            if (euro != '') {
                data.push(euro);
                return data;
            }
        });
        data = [...new Set(data)];
        data[0] = data[0].replace(/\t/g, '');
        data[0] = data[0].replace(/\n/g, '');
        data[0] = data[0].replace(/ /g, '');
        data[0] = data[0].replace('EUR', '');
        data[0] = data[0].replace(/,/g, '.');
        moneda_euro = data[0].split('CNY')[0];
        moneda_dollar = data[0].split('USD')[1];
        res.status(200).send({ euro: moneda_euro, dollar: moneda_dollar });
    });
});

/* Hace el Scrapping al Exchange Monitor - Dolares */
app.get('/dollar-paralelo', (req, res) => {
    axios.get('https://exchangemonitor.net/estadisticas/ve/dolar-enparalelovzla').then((response) => {

        const html = response.data;
        const $ = cheerio.load(html);

        let data = [];
        let dollar = '';

        $('div', '.container').each((index, element) => {
            dollar = ($(element).find('div.col.texto h2').text().trim());
            if (dollar) {
                data.push(dollar);
            }
        });
        data = [...new Set(data)];
        data[0] = data[0].replace(/\t/g, '');
        data[0] = data[0].replace(/\n/g, '');
        data[0] = data[0].replace(/ /g, '');
        data[0] = data[0].replace('BS/USD', '');
        data[0] = data[0].replace(/,/g, '.');
        res.status(200).send({ precio: data[0] });
    });
});

/* Hace el Scrapping al Exchange monitor de Pesos Colombianos */
app.get('/pesos-colombianos', (req, res) => {
    axios.get('https://exchangemonitor.net/calculadora/monedas/COP-VES').then((response) => {

        const html = response.data;
        const $ = cheerio.load(html);

        let data = [];
        let pesos_colombianos = '';

        $('div', '.row').each((index, element) => {
            pesos_colombianos = ($(element).find('h3').text().trim());
            if (pesos_colombianos) {
                data.push(pesos_colombianos);
            }
        });
        data = [...new Set(data)];
        data[0] = data[0].split('=')[1];
        data[0] = data[0].split('VES')[0];
        data[0] = data[0].replace(/,/g, '.');
        data[0] = data[0].trim();
        res.status(200).send({ precio: data[0] });
    });
});


/* Hace el Scrapping al Exchange de Pesos Argentinos */
app.get('/pesos-argentinos', (req, res) => {
    axios.get('https://coinyep.com/es/ex/ARS-USD').then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        let data = [];
        let pesos_argentinos = '';

        $('div', '.row.justify-content-md-center').each((index, element) => {
            pesos_argentinos = ($(element).find('small').text().trim());
            console.log('POR AQUI: ', pesos_argentinos);
            if(pesos_argentinos){
                data.push(pesos_argentinos);
            }
        });
        console.log('DATA OBTENIDA: ', data);
        let resultado = data[0].split(" ");
        res.status(200).send({ precio: resultado[3] });
    });
})

app.listen(PORT, () => {
    console.log("Servidor aperturado, puedes hacer las consultas:", PORT);
});