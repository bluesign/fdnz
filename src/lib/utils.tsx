import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as fcl from "@onflow/fcl"

export function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    parts[1] = (parts[1]+"0000").substring(0,2)
    return parts.join(".");
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/* global BigInt */

export function isEqual(address1, address2){
    return withPrefix(address1) === withPrefix(address2)
}

export function sansPrefix(address) {
    if (address == null) return null
    return cleanAddress(address).replace(/^0x/, "")
}

export function withPrefix(address) {
    if (address == null) return null
    return "0x" + sansPrefix(cleanAddress(address))
}

function cleanAddress(addr) {
    var address = addr.replace(/^0x/, "")
    while (address.length<16){
        address = "0" + address
    }
    address = "0x" + address
    return address
}

// [n,k,d]-Linear code parameters
// The linear code used in the account addressing is a [64,45,7]
// It generates a [64,45]-code, which is the space of Flow account addresses.
//
// n is the size of the code words in bits,
// which is also the size of the account addresses in bits.
const linearCodeN = 64

// Columns of the parity-check matrix H of the [64,45]-code used for Flow addresses.
// H is a (n x p) matrix with coefficients in GF(2), each column is converted into
// a big endian integer representation of the GF(2) column vector.
// H is used to verify a code word is a valid account address.
const parityCheckMatrixColumns = [
    0x00001, 0x00002, 0x00004, 0x00008,
    0x00010, 0x00020, 0x00040, 0x00080,
    0x00100, 0x00200, 0x00400, 0x00800,
    0x01000, 0x02000, 0x04000, 0x08000,
    0x10000, 0x20000, 0x40000, 0x7328d,
    0x6689a, 0x6112f, 0x6084b, 0x433fd,
    0x42aab, 0x41951, 0x233ce, 0x22a81,
    0x21948, 0x1ef60, 0x1deca, 0x1c639,
    0x1bdd8, 0x1a535, 0x194ac, 0x18c46,
    0x1632b, 0x1529b, 0x14a43, 0x13184,
    0x12942, 0x118c1, 0x0f812, 0x0e027,
    0x0d00e, 0x0c83c, 0x0b01d, 0x0a831,
    0x0982b, 0x07034, 0x0682a, 0x05819,
    0x03807, 0x007d2, 0x00727, 0x0068e,
    0x0067c, 0x0059d, 0x004eb, 0x003b4,
    0x0036a, 0x002d9, 0x001c7, 0x0003f,
].map(BigInt)

const NETWORK_CODEWORDS = {
    "mainnet": BigInt(0),
    "testnet": BigInt("0x6834ba37b3980209"),
    "emulator": BigInt("0x1cb159857af02018"),
    "previewnet": BigInt("0x5211829E88528817"),
}

const NETWORKS = new Set(["mainnet", "testnet","previewnet"])

export function getNetworkFromAddress(address){
    var result = null;
    NETWORKS.forEach(element => {
        if (isValidAddressForNetwork({address:withPrefix(address), network: element})){
            result = element;
        }
    });
    return result;
}

export function isValidAddressForNetwork({
                                             address,
                                             network
                                         }) {
    if (!address) throw new Error("isValidAddressForNetwork({ address }) -- address is required")
    if (typeof address !== "string") throw new Error("isValidAddressForNetwork({ address }) -- address must be a string")
    if (!network) throw new Error("isValidAddressForNetwork({ network }) -- network is required")
    if (typeof network !== "string") throw new Error("isValidAddressForNetwork({ network }) -- network must be a string")

    if (!(NETWORKS.has(network))) throw new Error(`isValidAddressForNetwork({ network }) -- network=${network} is not supported`)

    let networkCodeword = NETWORK_CODEWORDS[network]
    if (typeof networkCodeword === "undefined") throw new Error(`isValidAddressForNetwork -- Could not find network codeword for network=${network}`)

    let codeWord = BigInt(address)
    codeWord ^= networkCodeword

    if (codeWord === BigInt(0)) {
        return false
    }

    // Multiply the code word GF(2)-vector by the parity-check matrix
    let parity = BigInt(0)
    for (let i = 0; i < linearCodeN; i++) {
        if ((codeWord & BigInt(1)) === BigInt(1)) {
            parity ^= parityCheckMatrixColumns[i]
        }
        codeWord >>= BigInt(1)
    }

    return (parity === BigInt(0)) && (codeWord === BigInt(0))
}

export function fmtFlow(balance) {
    if (balance == null) return "N/A"
    return String(Number(balance) / 100000000) + " FLOW"
}

export function fmtTransactionStatus(status) {
    if (status === 0) return "UNKNOWN"
    if (status === 1) return "PENDING"
    if (status === 2) return "FINALIZED"
    if (status === 3) return "EXECUTED"
    if (status === 4) return "SEALED"
    if (status === 5) return "EXPIRED"
    return "N/A"
}


export function cadenceValueToDict(payload, brief){
    if (!payload) return null

    if (payload["type"]==="Array"){
        return cadenceValueToDict(payload["value"], brief)
    }

    if (payload["type"]==="Dictionary"){
        var resDict = {}
        payload["value"].forEach(element => {

            var skey = cadenceValueToDict(element["key"], brief)

            if (brief && skey ){
                if (skey.toString().indexOf("A.")===0){
                    skey = skey.toString().split(".").slice(2).join(".")
                }
                resDict[skey] = cadenceValueToDict(element["value"], brief)

            }else{
                resDict[cadenceValueToDict(element["key"], brief)] = cadenceValueToDict(element["value"], brief)
            }
        });
        return resDict
    }

    if (payload["kind"]==="Reference"){
        var referenced = payload["type"]["typeID"]
        if (payload.type.kind != "Struct" &&  payload.type.kind!="Resource" && payload.type.kind!="Intersection"){
            referenced = payload.type.kind
        }

        if (payload.authorization.kind=="Unauthorized"){
            return "&"+ referenced
        }
        if (payload.authorization.kind=="EntitlementConjunctionSet") {
            var auth = payload.authorization.entitlements.map((e)=>e.typeID)
            return "auth(" + auth.join(", ") +  ") &"+ referenced
        }
        if (payload.authorization.kind=="EntitlementDisjunctionSet") {
            var auth = payload.authorization.entitlements.map((e)=>e.typeID)
            return "auth(" + auth.join("| ") +  ") &"+ referenced
        }
    }


    if (payload["type"]==="Optional"){
        return cadenceValueToDict(payload["value"], brief)
    }
    if (payload["type"]==="Type"){
        return cadenceValueToDict(payload["value"]["staticType"], brief)
    }

    if (payload["type"]==="Address"){
        return payload["value"]
    }


    if (payload["kind"] && payload["kind"]==="Capability"){
        return payload["type"]["type"]["typeID"]
    }
    if (payload["type"]==="Capability"){
        var res = {}
        res["address"] = payload["value"]["address"]
        res["path"] = cadenceValueToDict(payload["value"]["path"], brief)
        res["borrowType"] = cadenceValueToDict(payload["value"]["borrowType"], brief)
        return {"<Capability>" : res}
    }

    if (payload["type"]==="Path"){
        return payload["value"]["domain"]+"/"+payload["value"]["identifier"]
    }

    if (payload["type"]==="UInt64") {
        return payload["value"]
    }

    if (payload["type"] && payload["type"].indexOf("Int")>-1){
        return parseInt(payload["value"])
    }

    if (Array.isArray(payload)){
        var resArray = []
        for (const i in payload) {
            resArray.push(cadenceValueToDict(payload[i], brief))
        }
        return resArray
    }


    if (payload["type"]==="Struct" || payload["type"]==="Resource"){
        return cadenceValueToDict(payload["value"], brief)
    }

    if (payload["id"]!=null && payload["id"].indexOf("A.")===0){

        res = {}
        for (const f in payload["fields"]){
            res[payload["fields"][f]["name"]] =  cadenceValueToDict(payload["fields"][f]["value"], brief)
        }
        var res2 = {}
        if (brief){
            res2[payload["id"].split(".").slice(2).join(".")] = res
        }
        else{
            res2[payload["id"]] = res
        }
        return res2
    }

    return payload["value"]

}



export const extractName = (address) => {
    return address.replace(/\s/g, "").replace("find:", "").replace(".find", "");
};

export const findAddress = async (address) => {
    const code = `
   import FIND from 0xFIND
    access(all) fun main(name: String): Address? {
        return FIND.lookupAddress(name)
    }
  `;
    const name = extractName(address);

    fcl.query({
            args: (arg, t) => [arg(name, t.String)],
            cadence: code,
        }).then(address=>{
        if (address){
            window.location = "/" + address
        }
    })

};


export const  executeScriptRaw = (props) =>{
    return fcl.send([fcl.script(props.query),
        fcl.args(props.args)]).catch((e) => {
            console.log(e)
    })

}
export const  executeScript = (props) => {
    return fcl.query({
        cadence: props.query,
        args: (arg, t) => props.args
    }).catch((e) => {
        console.log(e)
    })
}

export function checkNodes(parent, node, originAddress){
    if (!originAddress){
        return  node
    }

    if (node.children) {
        node.children = node.children.map(child=>{
            child = checkNodes(node, child, originAddress)
            return child
        })
    }
    else{
        var address  = node.value.match(/(0x)[0-9a-f]{12,16}/g)
        if (address){
            node.value = node.value.replace("\""+address[0]+"\"", address[0])
            parent.tagName = "a"
            parent.properties.href = `/${address}`
            parent.properties.title = `Check account - ${address}`
        }


        var storagePath  = node.value.match(/"(\/(storage)\/([a-zA-Z0-9_])*")/g)
        if (storagePath){
            node.value = node.value.replaceAll("\"","")
            parent.tagName = "a"

            parent.properties.href = `/${originAddress}` + node.value
            parent.properties.title = `Check Path - ${node.value}`
        }
        /* var contractEvent  = node.value.match(/A\.[0-9a-f]{12,16}\.(.*?)\.(.*?)/g)
         if (contractEvent){
           console.log(contractEvent)
         }
   */
    }

    return node
}