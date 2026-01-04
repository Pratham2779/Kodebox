import { deleteAvatar, uploadAvatar } from "./src/utils/user.util.js";
import bcrypt from 'bcrypt';
;(async ()=>{
  const isPasswordCorrect = await bcrypt.compare(
  "Pratham#79",
  "$2b$10$zBzZms2iYqcDvI9AMlLoVOBznQjtjNeS.ibsGlWA.ecJc/ZXZ4U4i"
);
console.log("hello",isPasswordCorrect);

})();