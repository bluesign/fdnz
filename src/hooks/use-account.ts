import {atomFamily, selectorFamily, useRecoilState} from "recoil"
import * as fcl from "@onflow/fcl"
import {getNetworkFromAddress, withPrefix} from "../lib/utils"
import {useEffect, useState} from "react"

export const IDLE = "IDLE"
export const PROCESSING = "PROCESSING"

// this is gross need to fix this in fcl
function ready() {
  return new Promise(resolve => {
    setTimeout(resolve,100)
  })
}

async function fetchAccount(address) {
  await ready()
  return address == null ? Promise.resolve(null) : fcl.account(address)
}


export const data = atomFamily({
  key: "ACCOUNT::DATA",
  default: selectorFamily({
    key: "ACCOUNT::PRIME",
    get: address => async () => fetchAccount(address),
  }),
})

export const fsm = atomFamily({
  key: "ACCOUNT::FSM",
  default: IDLE,
})

export function useAccount(address) {
  address = withPrefix(address)
  const [account, setAccount] = useState(address)

  useEffect(() => {
    fetchAccount(address).then((accountValue)=>{
      setAccount(accountValue)
    })

  }, [address])

  return account
}
