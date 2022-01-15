import Axios from 'axios'

export async function getTemperature() {
    return Axios.get('http://localhost:8080/temperature')
}

export async function togglePump() {
    return Axios.get('http://localhost:8080/pump-relay')
}

// export async function toggleRims() {
//     return Axios.get('http://localhost:8080/rims-relay)
// }