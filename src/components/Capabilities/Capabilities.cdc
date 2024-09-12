
access(all) fun main(address:Address):AnyStruct{
    var acct = getAuthAccount<auth(Capabilities) &Account>(address)
    var addr:Address = 0x11859edcf2f53edd

    var res : {String:[AnyStruct]} = {}
    res["issued"] = []
    res["published"] = []
    res["account"] = []
    for path in acct.storage.storagePaths{
        acct.capabilities.storage.forEachController(forPath: path, fun(s:&StorageCapabilityController):Bool{
            res["issued"]?.append({
                "id": s.capability.id,
                "tag": s.tag,
                "cap": s.capability,
                "path": path

            })
            return true
        })
    }

    acct.capabilities.account.forEachController(fun(s:&AccountCapabilityController):Bool{
          res["account"]?.append({
                "id": s.capability.id,
                "tag": s.tag,
                "cap": s.capability,
                "path": addr.toString()
            })
        return true
    })

    acct.storage.forEachPublic(fun(s:PublicPath,t:Type):Bool{
         var cap = (acct.capabilities.get<&AnyResource>(s) as Capability?) ?? (acct.capabilities.get<&AnyStruct>(s) as Capability?)
         if (cap==nil){
            return true
         }
         if let controller = acct.capabilities.storage.getController(byCapabilityID: cap!.id){

         res["published"]?.append({
                "id": cap?.id,
                "cap": controller.capability,
                "path": controller.target(),
                "link": s
            })
            }
            return true
    })
    return res
}