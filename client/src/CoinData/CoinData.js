import './CoinData.css'
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button} from 'react-bootstrap';
import {useEffect, useState} from "react";
import axios from "axios";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";
import useWebSocket from 'react-use-websocket';
import moment from 'moment';
import Chart from "./Chart";
import config from "../config/config.js"

const CoinData = () => {
    const [data, setData] = useState([]);
    const [histPrice, setHistPrice] = useState([]);
    const [currentCoin, setCurrentCoin] = useState();
    const [isChartLoading, setChartLoading] = useState(false);
    const [isWsLoading, setWsLoading] = useState(false);
    const [wsMessage, setwsMessage] = useState({});

    const {
        sendMessage,
        lastMessage,
    } = useWebSocket('ws://ws.coinapi.io/v1/');


    useEffect(() => {
        axios.get('http://localhost:3006/getAssetId')
            .then((response) => {
                setData(response.data)
            })

    }, [])

    useEffect(() => {
        if (lastMessage) {
            if(JSON.parse(lastMessage.data).message){
                alert("Error: " + JSON.parse(lastMessage.data).message)
                setwsMessage({})
                setWsLoading(false)
                return
            }
            setwsMessage(JSON.parse(lastMessage.data))
            console.log(JSON.parse(lastMessage.data))
            if (isWsLoading && JSON.parse(lastMessage.data).symbol_id.split('_')[2] == currentCoin){
                setWsLoading(false);
            }
        }
    }, [lastMessage])


    const onSubscribeBtn = () => {
        setChartLoading(true);
        setWsLoading(true);
        axios.get(`http://localhost:3006/historicalPrice?coin=${currentCoin}`)
            .then((response) => {
                if (response.data) {

                    setHistPrice(response.data.map((el) => {
                        const roundedValue = Number(el.rate_open).toFixed(2)
                        return [+new Date(el.time_open), +roundedValue]
                    }))
                    setChartLoading(false)
                }

            })
        sendMessage(JSON.stringify({
            "type": "hello",
            "apikey": config.apiKey,
            "heartbeat": false,
            "subscribe_data_type": ["trade"],
            "subscribe_filter_symbol_id": [
                `BITSTAMP_SPOT_${currentCoin}_USD$`,
                `ITBIT_SPOT_${currentCoin}_USD$`,
                `BINANCE_SPOT_${currentCoin}_USD$`

            ]
        }))
    }

    return (
        <div className="main-container">
            <div className="select-coin">
                <Dropdown className="dropdown" onChange={(e) => {
                    setCurrentCoin(e.value)
                }}
                          options={data.map(el => el.asset_id)}
                          placeholder="Select a coin"
                />
                <Button className="subscribe-btn" onClick={onSubscribeBtn} variant="primary">Subscribe</Button>{' '}
            </div>
            <p>Market data</p>
            <div className="market-data">
                {isWsLoading ? <Loader type="TailSpin" color="#0080ff" height={30} width={30}/> :
                    !wsMessage.price ? <h6>Please select a coin</h6>
                        :
                        <table width="100%" cellPadding="5">
                            <tr>
                                <th>Symbol:</th>
                                <th>Price:</th>
                                <th>Time:</th>
                            </tr>
                            <tr>

                                <td>{currentCoin}</td>
                                <td>{!wsMessage.price ?
                                    <p>Please select a coin</p> : " $ " + wsMessage.price}</td>
                                <td>{moment.unix(+new Date(wsMessage.time_coinapi) / 1000).format("MMM D, h:mm a")}</td>

                            </tr>
                        </table>
                }
            </div>
            <div className="charting-data">
                <p>Charting data</p>
                {isChartLoading ? <Loader type="TailSpin" color="#0080ff" height={80} width={80}/> :
                    <Chart
                        currentCoin={currentCoin}
                        filteredHistData={histPrice}
                    />
                }


            </div>
        </div>
    )
}

export default CoinData;