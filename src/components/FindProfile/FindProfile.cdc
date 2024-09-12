import FIND from 0x097bafa4e0b48eef
access(all) fun main(addr:Address): AnyStruct {
   var nick =  FIND.reverseLookup(addr)
   if nick==nil{
    return nil
   }
   return FIND.lookup(nick!)
}
