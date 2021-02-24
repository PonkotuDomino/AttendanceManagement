import React, { useState } from "react";
import { AppBar, Drawer, Toolbar, IconButton, Typography, makeStyles, createStyles } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

const drawerWidth = '240px';
const useStyles = makeStyles(theme => createStyles({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    toolbar: theme.mixins.toolbar,
}));

export function Header() {
    const classes = useStyles();
    const [open, setDrawerOpenState] = useState(false);
    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent,) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }

        setDrawerOpenState(open);
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="menu"
                        onClick={() => setDrawerOpenState(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        出退勤管理
                </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                anchor={'left'}
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
                onClose={toggleDrawer(false)}
            >
            </Drawer>
        </div>
    );
}