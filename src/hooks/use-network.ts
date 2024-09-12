import * as fcl from "@onflow/fcl"
import {getNetworkFromAddress} from "../lib/utils"
import {getNetworkConfig} from "../lib/config"
import {useState} from "react";

export function useNetworkForAddress(address){
  if (!address || address==="") return "";
  let [config, setConfig] = useState(null)
  let network = address.indexOf(".find")>-1 ? 'mainnet' : getNetworkFromAddress(address)
  if (config && config === network){
      return network
  }
  fcl.config(getNetworkConfig(network))
  setConfig(network)
  return network
}

