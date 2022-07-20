const { ethers } = require("ethers")
const weatherAbi = require("./weather-abi")
const multicallAbi = require("./multicall-abi")

require("dotenv").config()

const WEATHER_CONTRACT_ADDRESS = "0x49354813d8BFCa86f778DfF4120ad80E4D96D74E"
const MULTICALL_ADDRESS = "0x8A4D939d3D64ED8c92831aEbb87999f264e6d1D3"

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const multicall = new ethers.Contract(MULTICALL_ADDRESS, multicallAbi, wallet)

async function readWeathersFromContract(batchId, cities) {
    console.log(`Reading weathers of batchId: ${batchId}, through multicall contract: ${MULTICALL_ADDRESS}`)

    const iface = new ethers.utils.Interface(weatherAbi)
    const calls = cities.map((city) => {
        const callData = iface.encodeFunctionData("getWeather", [batchId, ethers.utils.formatBytes32String(city)])
        return [WEATHER_CONTRACT_ADDRESS, callData]
    })

    const response = await multicall.callStatic.aggregate(calls)
    for (let i = 0; i < cities.length; i++) {
        const temperature = iface.decodeFunctionResult("getWeather", response.returnData[i])
        console.log(`Got ${cities[i]}: ${temperature}`)
    }
}

async function main() {
    const cities = ["shanghai", "hongkong", "london"]
    const batchId = 1658306925

    await readWeathersFromContract(batchId, cities)
}

main().catch((e) => console.log(e))
