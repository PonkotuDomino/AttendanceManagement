import React, { useState } from "react";
import { AppBar, Box, Divider, Drawer, List, ListItem, ListItemText, Toolbar, IconButton, Typography, makeStyles, createStyles } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Link } from "react-router-dom";
import { Auth } from "../auth";

const drawerWidth = '240px';
const useStyles = makeStyles(theme => createStyles({
    container: {
        width: '100vw',
        top: 0,
        left: 0,
    },
    toolbar:{
        oppacity: 1
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
    drawerTitle: {
        padding: '10px',
        color: '#1f1f1f'
    },
    drawerMenu: {
        color: '#1f1f1f',
        textDecoration: 'none',
    }
}));

export function Header(props: { user: any }) {
    const classes = useStyles();
    const [open, setDrawerOpenState] = useState(false);
    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent,) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }

        setDrawerOpenState(open);
    };

    return (
        <Box className={classes.container}>
            <AppBar position="fixed">
                <Toolbar className={classes.toolbar}>
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
                anchor="left"
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
                onClose={toggleDrawer(false)}
            >
                <h3 className={classes.drawerTitle}>出退勤管理</h3>
                <Divider />
                <List>
                    <Link to="/" className={classes.drawerMenu}>
                        <ListItem button className={classes.drawerMenu}>
                            <ListItemText primary={'出退勤'} onClick={()=>setDrawerOpenState(false)} />
                        </ListItem>
                    </Link>
                    <Link to="/workingHours" className={classes.drawerMenu}>
                        <ListItem button>
                            <ListItemText primary={'勤務表'} onClick={()=>setDrawerOpenState(false)} />
                        </ListItem>
                    </Link>
                    <Link to="/expenses" className={classes.drawerMenu}>
                        <ListItem button>
                            <ListItemText primary={'交通費精算'} onClick={()=>setDrawerOpenState(false)} />
                        </ListItem>
                    </Link>
                    <Link to="/paidHoliday" className={classes.drawerMenu}>
                        <ListItem button>
                            <ListItemText primary={'有給管理'} onClick={()=>setDrawerOpenState(false)} />
                        </ListItem>
                    </Link>
                    <Link to="/timeSettingsMaster" className={classes.drawerMenu}>
                        <ListItem button>
                            <ListItemText primary={'勤務時間設定'} onClick={()=>setDrawerOpenState(false)} />
                        </ListItem>
                    </Link>
                    <Auth user={props.user}>
                        <Link to="/userMaster" className={classes.drawerMenu}>
                            <ListItem button>
                                <ListItemText primary={'ユーザマスタ'} onClick={()=>setDrawerOpenState(false)} />
                            </ListItem>
                        </Link>
                    </Auth>
                </List>
                <Divider />
            </Drawer>
        </Box>
    );
}