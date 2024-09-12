import {DataContent, Item, Section} from "../../components/TopBar";
import {CurrencyDollarIcon} from "@heroicons/react/24/solid";
import * as React from "react";
import {useNetworkForAddress} from "../../hooks/use-network";
import useSWR from 'swr'
import getVault from "./GetVault.cdc"
import queryFTVaults from "./FTVaults.cdc"
import {cadenceValueToDict, executeScript, executeScriptRaw, numberWithCommas} from "../../lib/utils"
import * as fcl from "@onflow/fcl";
import {NavLink} from "react-router-dom";
import {useParams} from "react-router-dom"
import YAML from "json-to-pretty-yaml"
import {useContext, useState} from "react";
import {Button} from "@headlessui/react";
import {clsx} from "clsx";
import {SearchContext} from "../SearchContext.ts";
import {FTDisplay} from "../MetaData.tsx";
import {withPrefix} from "@onflow/fcl";




export function FTVaultView() {
    var {address, domain, path} = useParams()
    address = withPrefix(address)

    useNetworkForAddress(address)

    const {data, error, isLoading} =
        useSWR([address, domain, path], () =>
            executeScriptRaw({
                query: getVault,
                args: [
                    fcl.arg(address, fcl.t.Address),
                    fcl.arg(path, fcl.t.String),
                ]
            }).then((v) => {
                return cadenceValueToDict(v.encodedData, false)

            }).catch((e) => {
                console.log(e)
            }))

    return <DataContent
        loading={isLoading} error={error}
        title=""
        subtitle = {`/storage/${path}`}>
               {data && FTDisplay(data, address)}
    </DataContent>
}

export default function FTVaults({props}) {
    var {address, domain, path} = useParams()
    address = withPrefix(address)

    const [showEmptyVaults, setShowEmptyVaults] = useState(false)
    const [showRecoveredVaults, setShowRecoveredVaults] = useState(false)
    const [isShown, setShown] = useState(domain == "ft")
    const searchContext = useContext(SearchContext)


    useNetworkForAddress(address)
    const {data, error, isLoading} =
        useSWR(`ftvaults_${address}`, () =>
            executeScript({
                query: queryFTVaults,
                args: [
                    fcl.arg(address, fcl.t.Address),
                ]
            }).catch((e) => {
                console.log(e)
            })
        )

    var recovered = 0
    var empty = 0

    if (data){
        data.sort((a, b) => {
            if (!a.isRecovered && b.isRecovered ) return -1
            if (a.isRecovered && !b.isRecovered ) return 1
            return parseFloat(a.balance) < parseFloat(b.balance)
        })

        searchContext["FT"] =   {
            heading: "Fungible Token Vaults",
            id: "ft",
            items: [],
        }

        data.map((vault) => {
             const item = {
                    id: vault.type.typeID,
                    children: vault.type.typeID,
                    icon: "CurrencyDollarIcon",
                    href: `/${address}/ft/${vault.path.identifier}`,
                }
            searchContext["FT"].items.push(item)
        })

        recovered = data.filter((vault) => (vault.isRecovered)).length
        empty = data.filter((vault) => (parseFloat(vault.balance) == 0)).length
    }


    return <Section Icon={CurrencyDollarIcon}
                       expanded={isShown}
                       setExpanded={setShown}
                        canExpand={data && data.length > 0}
                        title="Fungible Token Vaults"
                       subtitle={`${data && data.length} Vaults`}
                       loading={isLoading}
                       error={error}
        >
            {data && data.filter((vault) => (showEmptyVaults || parseFloat(vault.balance) > 0.0))
            .filter((vault) => (showRecoveredVaults || !vault.isRecovered)).map((vault) =>
                <Item
                    selected={domain=="ft" && path==vault.path.identifier}
                    key={`ft_${vault.path.identifier}`}>
                    <NavLink to={`/${address}/ft/${vault.path.identifier}`}>
                        <p> {vault.path.identifier} {vault.isRecovered?"(Legacy)":""} - {numberWithCommas(vault.balance)} </p>
                        <p className="opacity-70 text-xs ">{vault.type.typeID} </p>
                    </NavLink>
                </Item>)
            }

        {data && recovered>0 && <Item className="flex text-xs text-left opacity-50" key={`ft_hide_show_action`}>
            <Button className="text-xs flex opacity-70" onClick={() => setShowRecoveredVaults(!showRecoveredVaults)}>
                <b>{showRecoveredVaults ? "Hide" : "Show"} {recovered} legacy vault{recovered>1?"s":""}</b>
            </Button>
        </Item>}

            {data && empty>0 && <Item className="flex text-xs text-left opacity-50" key={`ft_hide_show_action2`}>
                <Button className="text-xs flex opacity-70" onClick={() => setShowEmptyVaults(!showEmptyVaults)}>
                    <b>{showEmptyVaults ? "Hide" : "Show"} {empty} empty vault{empty>1?"s":""}</b>
                </Button>
            </Item>}


        </Section>

}