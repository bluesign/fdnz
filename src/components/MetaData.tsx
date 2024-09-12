import * as React from "react";
import YAML from "json-to-pretty-yaml"
import {DataContent, SyntaxHighlight} from "./TopBar.tsx";

function unwrap(view) {
    var keys = Object.keys(view)
    if (keys.length == 1) {
        return view[keys[0]]
    }
    return null
}
export function FTDisplay(ft, address) {
    var view = ft.display

    if (!view) {
        var code = YAML.stringify(ft.object, null, 2)
        return <SyntaxHighlight  address={address} data = { code}/>
    }
    view = unwrap(view)

    let image = ""
    let logos = unwrap(view.logos)
    if (logos.items.length>0){
        image = unwrap(logos.items[0]).file
    }


    return <div className="flex  flex-col min-w-52 min-h-60" key={ft.id}>
        <div
            className="flex border-2 overflow-hidden w-52 min-h-60 bg-white dark:bg-gray-900 shadow-lg border-gray-400 dark:border-gray-800 rounded-xl m-2 flex flex-col">
            <div className="flex min-w-52 flow-grow min-h-52">
                <img className="flex min-w-52 object-cover" src={MetaImage(image)}/>
            </div>
            <div className="flex flex-grow flex-col items-center">
                <div className="text-sm flex-grow text-center font-bold pt-4">
                    {unwrap(ft.object).balance} {view.symbol}
                </div>
                <div className="flex-grow text-center opacity-70 text-xs font-bold pb-4 ">
                    {view.name}
                </div>
            </div>

        </div>
    </div>

}

export function MetaImage(image) {
    var view2 = image
    var keys = Object.keys(view2)
    if (keys.length == 1) {
        view2 = view2[keys[0]]
    }
    if (view2.cid != null) {
        var path = view2.path ?? "";
        if (path && path.length > 0) {
            path = "/" + path;
        }
        return `https://ipfs.io/ipfs/${view2.cid}${path}`
    }
    return view2.url
}

export function NFTDisplay(nft) {
    var view = nft.display
    if (!view) {
        var code = YAML.stringify(nft, null, 2)
        return <div>
                       <pre className="font-normal">
            {code}
                       </pre>
        </div>
    }
    var keys = Object.keys(view)
    if (keys.length == 1) {
        view = view[keys[0]]
    }

    return <div className="flex  flex-col min-w-52 min-h-60" key={nft.id}>
        <div
            className="flex border-2 overflow-hidden w-52 min-h-60 bg-white dark:bg-gray-900 shadow-lg border-gray-400 dark:border-gray-800 rounded-xl m-2 flex flex-col">
            <div className="flex min-w-52 flow-grow min-h-52">
                <img className="flex min-w-52 object-cover" src={MetaImage(view.thumbnail)}/>
            </div>
            <div className="flex flex-grow items-center">
                <div className="text-sm flex-grow text-center font-bold p-4 ">
                    {view.name}
                </div>
            </div>
        </div>
    </div>

}