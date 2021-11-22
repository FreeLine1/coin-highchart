const PORT = 3006;
const configAPI = require('./config/config.js');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');


const app = express();
app.use(cors());

app.get('/getAssetId', (req, res) => {


    const config = {
        method: 'get',
        url: 'https://rest.coinapi.io/v1/assets?filter_asset_id=BTC;ETH;XRP;LINK;LTC;BCH;XLM;EOS',
        headers: {
            'X-CoinAPI-Key': configAPI.apiKey
        }
    };

    axios(config)
        .then(function (response) {
            res.send(response.data)
        })
        .catch(function (error) {
            console.log(error);
        });

});

app.get('/historicalPrice', (req, res) => {

    const axios = require('axios');

    const config = {
        method: 'get',
        url: `https://rest.coinapi.io/v1/exchangerate/${req.query.coin}/USD/history?period_id=1DAY&limit=300&time_start=2020-11-16T00:00:00&time_end=2021-11-21T18:04:00`,
        headers: {
            'X-CoinAPI-Key': configAPI.apiKey
        }
    };

    axios(config)
        .then(function (response) {
            res.send(response.data)
        })
        .catch(function (error) {
            console.log(error);
        });

})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))