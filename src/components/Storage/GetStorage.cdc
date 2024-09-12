import FungibleToken from 0xFungibleToken
access(all) fun main(address:Address, path:String):AnyStruct{
    var acc = getAuthAccount<auth(Storage) &Account>(address)

    var t = acc.storage.type(at: StoragePath(identifier:path)!)
    if t==nil{
        return ""
    }

    if t!.isSubtype(of:Type<AnyStruct>()){
        return acc.storage.borrow<&AnyStruct>(from:StoragePath(identifier:path)!)!
    }

    if t!.isSubtype(of:Type<@AnyResource>()){
         return acc.storage.borrow<&AnyResource>(from:StoragePath(identifier:path)!)!
    }

    return "ERROR"
}