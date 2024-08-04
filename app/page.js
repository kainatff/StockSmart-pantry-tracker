'use client';

import { useState, useEffect, useRef } from "react";
import { collection, query, getDocs, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { AppBar, Toolbar, Box, Button, Modal, Stack, TextField, Typography, IconButton, Container } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { keyframes } from '@mui/system';

// Define the keyframes for the sliding animation
const slide = keyframes`
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(20px);
  }
  100% {
    transform: translateX(0);
  }
`;

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [originalInventory, setOriginalInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [animateCart, setAnimateCart] = useState({});
  const searchRef = useRef(null);
  const buttonRef = useRef(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setOriginalInventory(inventoryList);
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
    triggerCartAnimation(item);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const searchItems = (searchTerm) => {
    const filteredItems = originalInventory.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setInventory(filteredItems);
  };

  const triggerCartAnimation = (item) => {
    setAnimateCart((prev) => ({ ...prev, [item]: true }));
    setTimeout(() => {
      setAnimateCart((prev) => ({ ...prev, [item]: false }));
    }, 1000);
  };

  useEffect(() => {
    updateInventory();
  }, []);
  
  useEffect(() => {
    searchItems(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (searchRef.current && buttonRef.current) {
      const searchHeight = searchRef.current.clientHeight;
      buttonRef.current.style.height = `${searchHeight}px`;
    }
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const searchRecipe = (itemName) => {
    const query = `recipes with ${itemName}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <Box width="100vw" height="100vh" bgcolor="#283044ff" color="#ebf5eeff">
      <AppBar position="static" style={{ backgroundColor: "#78a1bbff" }}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            StockSmart
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Typography
          variant="h2"
          style={{ color: "#ebf5eeff", marginBottom: '2rem' }}
        >
          Manage Your Inventory
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2} marginBottom="1rem">
          <Button
            variant="contained"
            onClick={handleOpen}
            ref={buttonRef}
            style={{ backgroundColor: "#78a1bbff", color: "#ebf5eeff" }}
          >
            Add New Item
          </Button>
          <TextField
            variant="outlined"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              style: {
                color: '#283044ff'
              }
            }}
            ref={searchRef}
            style={{ width: '100%', maxWidth: '600px', backgroundColor: '#ebf5eeff' }}
          />
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="#ebf5eeff"
            border="2px solid #78a1bbff"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)"
            }}
          >
            <Typography variant="h6" style={{ color: "#78a1bbff" }}>Add Items</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleClose();
                }}
                style={{ borderColor: "#78a1bbff", color: "#78a1bbff" }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box border="1px solid #78a1bbff" mt={2} width="100%" maxWidth="800px" mx="auto">
          <Box width="100%" height="100px"
            bgcolor="#78a1bbff" display="flex" alignItems="center" justifyContent="center"
          >
            <Typography variant="h2" style={{ color: "#ebf5eeff" }}>
              Inventory Items
            </Typography>
          </Box>
        </Box>
        <Stack width="100%" maxWidth="800px" spacing={2} overflow="auto" mt={2} mx="auto">
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#78a1bbff"
              padding={2}
              mb={2}
              borderRadius="8px"
            >
              <Typography variant="h6" style={{ color: "#283044ff" }} textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6" style={{ color: "#283044ff" }} textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => addItem(name)}
                  style={{ backgroundColor: "#283044ff", color: "#ebf5eeff" }}
                  sx={animateCart[name] ? { animation: `${slide} 1s ease` } : {}}
                >
                  Add to cart <ShoppingCartIcon style={{ marginLeft: '8px' }} />
                </Button>
                <IconButton
                  onClick={() => removeItem(name)}
                  style={{ backgroundColor: "#283044ff", color: "#ebf5eeff" }}
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  variant="contained"
                  onClick={() => searchRecipe(name)}
                  style={{ backgroundColor: "#283044ff", color: "#ebf5eeff" }}
                >
                  Recipe
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
