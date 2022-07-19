const { ethers } = require("ethers")
const abi = require("./abi")

require("dotenv").config()

const WEATHER_CONTRACT_ADDRESS = "0x49354813d8BFCa86f778DfF4120ad80E4D96D74E"

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const weatherContract = new ethers.Contract(WEATHER_CONTRACT_ADDRESS, abi, wallet)

async function queryWeathers(cities) {
    console.log(`Querying weathers from https://goweather.herokuapp.com/weather`)
    return await Promise.all(
        cities.map(async (city) => {
            const response = await ethers.utils.fetchJson(`https://goweather.herokuapp.com/weather/${city}`)
            console.log(`Got ${city}: ${response.temperature}`)
            return {
                city: city,
                temperature: parseInt(response.temperature),
            }
        })
    )
}

async function reportWeathers(batchId, weathers) {
    console.log(`Reporting weathers to contract address: ${WEATHER_CONTRACT_ADDRESS}`)

    for (const weather of weathers) {
        let txResponse = await weatherContract.reportWeather(
            batchId,
            ethers.utils.formatBytes32String(weather.city),
            weather.temperature
        )
        let txReceipt = await txResponse.wait(1)
        console.log(
            `Reported ${weather.city}'s temperature: ${weather.temperature} at tx: ${txReceipt.transactionHash}`
        )
    }
}

async function readWeathersFromContract(batchId, cities) {
    console.log(`Reading weathers from contract address: ${WEATHER_CONTRACT_ADDRESS}`)
    for (const city of cities) {
        let temperature = await weatherContract.getWeather(batchId, ethers.utils.formatBytes32String(city))
        console.log(`Got ${city}: ${temperature}`)
    }
}

async function main() {
    const cities = ["shanghai", "hongkong", "london"]
    const batchId = Math.round(Date.now() / 1000)

    const weathers = await queryWeathers(cities)
    console.log("------------------------------")
    await reportWeathers(batchId, weathers)
    console.log("------------------------------")
    await readWeathersFromContract(batchId, cities)
}

main().catch((e) => console.log(e))
