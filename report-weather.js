const { ethers } = require("ethers")
const abi = require("./abi")

require("dotenv").config()

const cities = ["shanghai", "hongkong", "london"]

const WEATHER_CONTRACT_ADDRESS = "0x49354813d8BFCa86f778DfF4120ad80E4D96D74E"

async function main() {
    const weathers = await Promise.all(
        cities.map(async (city) => {
            const response = await ethers.utils.fetchJson(`https://goweather.herokuapp.com/weather/${city}`)
            return {
                city: city,
                temperature: parseInt(response.temperature),
            }
        })
    )

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    const weatherContract = new ethers.Contract(WEATHER_CONTRACT_ADDRESS, abi, wallet)

    const batchId = 54212

    for (const weather of weathers) {
        let txResponse = await weatherContract.reportWeather(batchId, weather.city, weather.temperature)
        await txResponse.wait(1)
    }

    for (const city of cities) {
        let txResponse = await weatherContract.getWeather(batchId, city)
        console.log(txResponse)
    }
}

main().catch((e) => console.log(e))
