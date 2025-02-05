import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import ViewResolver from 0xMetadataViews


access(all) fun main(address:Address, path:String, id:UInt64):AnyStruct{

        var acc = getAuthAccount<auth(Storage) &Account>(address)
        var obj = acc.storage.borrow<&AnyResource>(from: StoragePath(identifier: path)!)!
        var meta = obj as? &{ViewResolver.ResolverCollection}

        if (id>0){
            var vr = meta!.borrowViewResolver(id:id)
            var res : {String:AnyStruct} = {}

            if let  views = vr?.getViews(){
                for mdtype in views{
                    if mdtype==Type<MetadataViews.NFTView>() {
                        continue
                    }
                    if mdtype==Type<MetadataViews.NFTCollectionData>() {
                        continue
                    }
                    res[mdtype.identifier]=vr?.resolveView(mdtype)
                }
            }

            return res
        }


        if meta!=nil && meta!.getIDs().length>0{
            var res : [AnyStruct] = []
            for nftid in meta!.getIDs(){
                if let vr = meta!.borrowViewResolver(id:nftid){
                    var view = vr.resolveView(Type<MetadataViews.Display>())!
                    res.append({
                        "id": nftid,
                        "display": view
                    })
                }
            }
            return res
        }
        else{
            var col = acc.storage.borrow<&AnyResource>(from: StoragePath(identifier: path)!)! as AnyStruct

            return col
        }
}