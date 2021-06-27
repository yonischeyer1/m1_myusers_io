import React from "react";
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { getRandomId } from "../../utils/general";
import ActionsDropdownEvents from "./ActionsDropdown.events";


export interface MenuItemOption {
    label:string;
    disabled:boolean;
}


export default function ActionsDropdown (props:any) {
  const _events = new ActionsDropdownEvents();
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const randomId = getRandomId();

  const [state, setState] = React.useState({
        open:false,
  });

  _events.setConstructor(state, setState, props, anchorRef)

  const { open } = state;
  const { options } = props;

 return (
 <div>
  <ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="split button">
  <Button style={{pointerEvents:"none"}} >{'Actions'}</Button>
  <Button
   color="primary"
   size="small"
   aria-controls={open ? `split-button-menu-${randomId}` : undefined}
   aria-expanded={open ? 'true' : undefined}
   aria-label="select merge strategy"
   aria-haspopup="menu"
   onClick={_events.handleToggle.bind(_events)}
  >
   <ArrowDropDownIcon />
  </Button>
 </ButtonGroup>
 <Popper style={{zIndex:1}} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
  {({ TransitionProps, placement }) => (
  <Grow
    {...TransitionProps}
    style={{
      transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
    }}>
    <Paper>
      <ClickAwayListener onClickAway={_events.handleClose.bind(_events)}>
        <MenuList id={`split-button-menu-${randomId}`}>
          {options.map((option:any) => (
            <MenuItem
              key={option.label}
              disabled={option.disabled}
              onClick={(e:any)=>{_events.handleMenuItemClick.bind(_events)(option)}}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </ClickAwayListener>
    </Paper>
   </Grow>
   )}
   </Popper>
  </div>
 )
}