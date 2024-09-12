import * as React from "react";
import {useParams} from "react-router-dom"
import {UserIcon} from "@heroicons/react/24/solid";
import {Section} from "../TopBar.tsx";
import {executeScript} from "../../lib/utils.tsx";
import {useState} from "react";
import useSWR from "swr";
import findProfile from "../FindProfile/FindProfile.cdc";
import * as fcl from "@onflow/fcl";
import {withPrefix} from "@onflow/fcl";

export default function FindProfile() {
    var {address} = useParams()
    address = withPrefix(address)
    const [isShown, setShown] = useState(false)
    const {data, error, isLoading} =
        useSWR(`findprofile_${address}`, () =>
            executeScript({
                query: findProfile,
                args: [
                    fcl.arg(address, fcl.t.Address),
                ]
            }))

    if (!data){
        return <></>
    }
    return <Section Icon={UserIcon}
                    expanded={isShown}
                    setExpanded={setShown}
                    canExpand={true}
                    title=".find Profile"
                    subtitle={data.findName}
                    loading={isLoading}
                    error={error}
    >

        <div>
            <div className="flex flex-row text-sm">
                <div className="w-48 m-1 max-w-48">
                    <img className="rounded-3xl" src={data.avatar}/>
                </div>
                <div className="flex-col flex-wrap flex-auto">
                    <div className="opacity-50 text-sm text-wrap">
                        {data.description}
                    </div>
                </div>
            </div>
        </div>

    </Section>


}