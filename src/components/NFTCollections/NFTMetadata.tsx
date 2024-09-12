import * as React from "react";
import {MetaImage} from "../MetaData.tsx";

function NFTCollectionDisplay({ view }) {
    if (!view) return null;
    view = view["MetadataViews.NFTCollectionDisplay"];
    return (
        <div>
            <p className="text-sm font-bold opacity-70 pb-1">
                <span icon="solid fa-info-circle" />Collection Information
            </p>
            <p className="text-sm">{view["name"]}</p>
            <p className="text-sm opacity-70">{view["description"]}</p>
        </div>
    );
}


function NFTDisplayText({ view, children }) {
    if (!view) return null;
    view = view["MetadataViews.Display"];
    return (
        <div>
            <div className="space-y-4 p-1">
                <img
                    src={MetaImage(view["thumbnail"])}
                    alt=""
                    className="max-w-[40vh] rounded-lg object-contain"
                />
                <p className="text-lg opacity-70 font-bold">{view["name"]}</p>
                <p className="text-sm opacity-70 ">{view["description"]}</p>
                {children}
            </div>
        </div>
    );
}

function ExternalURL({ view }) {
    if (!view) return null;
    view = view["MetadataViews.ExternalURL"];

    return (
        <div className="mb-4">
            <p className="text-sm opacity-70 font-bold mb-1">
                <span icon="solid fa-link" /> External URL
            </p>
            <a
                href={view["url"]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
                {view["url"]}
            </a>
        </div>
    );
}

function Editions({ view }) {
    if (!view) return null;
    view = view["MetadataViews.Editions"];

    return (
        <div className="mb-4">
            <p className="text-sm opacity-70 font-bold mb-2">
                <span icon="solid fa-registered" /> Edition
            </p>
            {view["infoList"] && view["infoList"].map((item, index) => (
                <div key={index} className="mb-2">
                    {item["MetadataViews.Edition"]["name"] && (
                        <p className="text-sm">
                            Name: <span className="text-gray-600">{item["MetadataViews.Edition"]["name"]}</span>
                        </p>
                    )}
                    {item["MetadataViews.Edition"]["number"] != null && (
                        <p className="text-sm">
                            Number: <span className="text-gray-600">{item["MetadataViews.Edition"]["number"]}</span>
                        </p>
                    )}
                    {item["MetadataViews.Edition"]["max"] != null && (
                        <p className="text-sm">
                            Max: <span className="text-gray-600">{item["MetadataViews.Edition"]["max"]}</span>
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
function Serial({ view }) {
    if (!view) return null;
    view = view["MetadataViews.Serial"];

    return (
        <div className="mb-4">
            <p className="text-sm font-bold opacity-70  mb-2">
                <span icon="solid fa-hashtag" /> Serial
            </p>
            <p className="text-sm">
                Number: <span className="text-gray-600">{view["number"]}</span>
            </p>
        </div>
    );
}
function Traits({ view }) {
    if (!view) return null;
    view = view["MetadataViews.Traits"];
    if (view["traits"].length === 0) return null;

    return (
        <div className="mb-4">
            <p className="text-sm opacity-70 font-bold mb-2">
                <span icon="solid fa-bars" /> Traits
            </p>
            {view["traits"].map((trait, index) => {
                let value = trait["MetadataViews.Trait"]["value"];
                if (value) {
                    value = value.toString();
                }
                const name = trait["MetadataViews.Trait"]["name"];

                return (
                    <div key={index} className="text-sm mb-1">
                        {name}:
                        <span
                            className="text-gray-600 ml-1"
                        >
              {value}
            </span>
                    </div>
                );
            })}
        </div>
    );
}
function Royalties({ view }) {
    if (!view) return null;
    view = view["MetadataViews.Royalties"];
    if (view["cutInfos"].length === 0) return null;

    return (
        <div className="mb-4">
            <p className="text-base opacity-70 font-bold mb-2">
                <span icon="solid fa-coins" /> Royalties
            </p>
            {view["cutInfos"].map((item, index) => (
                <div key={index} className="mb-3">
                    <p className="text-sm font-medium mb-1">Royalty</p>
                    <p className="text-sm text-gray-600 mb-1">
                        {item["MetadataViews.Royalty"]["description"]}
                    </p>
                    <p className="text-sm mb-1">
                        Address:{' '}
                        <span className="text-gray-600">
              {item["MetadataViews.Royalty"]["receiver"]["<Capability>"]["address"]}
            </span>
                    </p>
                    <p className="text-sm">
                        Cut:{' '}
                        <span className="text-gray-600">
              {item["MetadataViews.Royalty"]["cut"]}
            </span>
                    </p>
                </div>
            ))}
        </div>
    );
}

function parseFile(f) {
    if (!f) return "";
    if (f["MetadataViews.Media"]) {
        f = f["MetadataViews.Media"]["file"];
    }
    if (f["MetadataViews.HTTPFile"]) {
        return f["MetadataViews.HTTPFile"]["url"];
    }
    if (f["MetadataViews.IPFSFile"]) {
        return "https://ipfs.io/ipfs/" + f["MetadataViews.IPFSFile"]["cid"];
    }
    return "";
}

function parseMime(f) {
    if (!f) return "";
    if (f["MetadataViews.Media"]) {
        return f["MetadataViews.Media"]["mediaType"];
    }
    return "";
}

function Medias({ view }) {
    if (!view) return null;
    view = view["MetadataViews.Medias"];

    return (
        <div className="mb-4">
            <p className="text-sm opacity-70 font-bold mb-2">
                <span icon="solid fa-photo-film"/> Medias
            </p>
            <p className="text-sm font-medium">{view["name"]}</p>
            <p className="text-sm text-gray-600 mb-2">{view["description"]}</p>

            <div className="flex flex-row flex-wrap gap-2">
                {view["items"].map((item, index) => {
                    const mime = parseMime(item);
                    const isVideo = mime.indexOf("video") > -1;
                    const MediaComponent = isVideo ? 'video' : 'img';

                    return (
                        <div key={index} className="w-48 h-48 overflow-hidden rounded-lg border border-gray-200">
                            <MediaComponent
                                src={parseFile(item)}
                                className="w-full h-full object-cover"
                                controls={isVideo}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
export function NFTMetaDataView(storage) {



    return (
        <div className="ml-1 flex flex-row flex-wrap">

                <div className="m-1 flex flex-row flex-wrap">
                    <div className="flex-1 min-w-[200px] rounded-lg border-0 border-gray-300">
                        <NFTDisplayText view={storage["MetadataViews.Display"]}>
                            <ExternalURL view={storage["MetadataViews.ExternalURL"]} />
                            <Editions view={storage["MetadataViews.Editions"]} />
                            <Serial view={storage["MetadataViews.Serial"]} />
                            <Traits view={storage["MetadataViews.Traits"]} />
                        </NFTDisplayText>
                    </div>
                    <div className="flex-1 min-w-[200px] m-3 rounded-lg border-0 border-gray-300">
                        <NFTCollectionDisplay view={storage["MetadataViews.NFTCollectionDisplay"]} />
                        <br />
                        <Royalties view={storage["MetadataViews.Royalties"]} />
                        <br />
                        <Medias view={storage["MetadataViews.Medias"]} />
                    </div>
                </div>



        </div>
    );
}

