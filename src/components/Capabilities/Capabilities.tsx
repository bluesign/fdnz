import {DataContent, Item, Section, SyntaxHighlight} from "../TopBar.tsx";
import {Cog6ToothIcon, DocumentIcon,LinkIcon} from "@heroicons/react/24/solid";
import * as React from "react";
import {useContext, useState} from "react";
import {SearchContext} from "../SearchContext.ts";
import {useNetworkForAddress} from "../../hooks/use-network";
import {NavLink, useParams} from "react-router-dom"
import {cadenceValueToDict, executeScript, executeScriptRaw, numberWithCommas} from "../../lib/utils.tsx";
import useSWR from "swr";
import * as fcl from "@onflow/fcl";
import queryCapabilities from "./Capabilities.cdc";
import {withPrefix} from "@onflow/fcl";
import YAML from "json-to-pretty-yaml"

export function CapabilitiesView() {
    var {address, path} = useParams()
    address = withPrefix(address)
    function capitalize(s)
    {
        return s[0].toUpperCase() + s.slice(1);
    }
    useNetworkForAddress(address)
    const {data, error, isLoading} =
        useSWR(`capabilities_${address}`, () =>
            executeScriptRaw({
                query: queryCapabilities,
                args: [
                    fcl.arg(address, fcl.t.Address),
                ]
            }).then((v)=>{

                return cadenceValueToDict(v.encodedData, false)
            })
        )

    let items = data ? data[path]: []
    if (items) {
        items.sort((a, b) => {
            return a.path > b.path
        })
    }

    var capabilityData = {}
    items && items.map((capability) => {
        var capData = {
            Id: parseInt(capability.id),
            Type: capability.cap["<Capability>"].borrowType,
        }
        const path = "/"+capability.path
        if (capability.link){
            capData.Link = "/"+capability.link
        }
        if (capabilityData[path]){
            capabilityData[path].push(capData)
        }
        else{
            capabilityData[path] = [capData]
        }
    })


    return <DataContent
        loading={isLoading} error={error}
        title={`${capitalize(path)} Capabilities`}
        subtitle={address}>
        <div className={"flex pl-2 flex-grow flex-nowrap flex-col pt-4 space-y-3"}>
            {Object.keys(capabilityData).map((capability) =>
                <>
                    <div className={"flex space-y-0 flex-col"}>
                <SyntaxHighlight address={address} data = {YAML.stringify({Path:capability, Capabilities: capabilityData[capability]}, null, 2 )}/>
                    </div>
                </>
            )}

        </div>
    </DataContent>
}


export default function Capabilities() {
    var {address, domain, path} = useParams()
    address = withPrefix(address)

    const [showEmptyVaults, setShowEmptyVaults] = useState(false)
    const [isShown, setShown] = useState(domain == "cap")
    const searchContext = useContext(SearchContext)

    useNetworkForAddress(address)



    return <Section
        Icon={Cog6ToothIcon}
        title="Capabilities"
        expanded={isShown}
        setExpanded={setShown}
        canExpand={true}
    >
        <Item selected={domain=="cap" && path=="published"}>
            <NavLink to={`/${address}/cap/published`}>
                <p> Published </p>
            </NavLink>
        </Item>
        <Item selected={domain=="cap" && path=="issued"}>
            <NavLink to={`/${address}/cap/issued`}>
                <p> Issued </p>
            </NavLink>
        </Item>
        <Item selected={domain=="cap" && path=="account"}>
            <NavLink to={`/${address}/cap/account`}>
                <p> Account </p>
            </NavLink>
        </Item>
        </Section>

}