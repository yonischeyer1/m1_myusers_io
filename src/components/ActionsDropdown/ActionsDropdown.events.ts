import { setStatePromisifed } from "../../utils/general";
import { MenuItemOption } from "./ActionsDropdown";


export default class ActionsDropdownEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    anchorRef:any
    constructor() {   }
  
     async setConstructor(state:any, setState:any, props:any, anchorRef:any) {
         this.anchorRef = anchorRef;
         this.state = state;
         this.setState = setStatePromisifed.bind(null, setState);
         this.props = props;
      }
  
    async init () { }
    
    async handleMenuItemClick  (option:any) {
        this.props.handleMenuItemClick(option); 
    }
   
   async handleToggle (index:any)  {
      await this.setState({...this.state, open: !this.state.open})
   };
   
   async handleClose (e: any) {
       if (this.anchorRef.current && this.anchorRef.current.contains(e.target as HTMLElement)) {
         return;
       }
       await this.setState({...this.state, open:false})
   };
    
}

