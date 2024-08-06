'use client';

import React, { useState, useEffect, useRef } from "react";
import { collection, query, getDocs, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { AppBar, Toolbar, Box, Button, Modal, Stack, TextField, Typography, IconButton, Container } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { keyframes } from '@mui/system';

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

const colors = {
  black: "#040303ff",
  darkSlateGray: "#3a4e48ff",
  gray: "#6a7b76ff",
  cambridgeBlue: "#8b9d83ff",
};

const CoverPage = ({ onEnter }) => (
  <Box 
    width="100vw" 
    height="100vh" 
    display="flex" 
    flexDirection="column" 
    justifyContent="center" 
    alignItems="center" 
    bgcolor={colors.black}
  >
    <Typography 
      variant="h1" 
      style={{ 
        fontFamily: "'Playfair Display', serif", 
        fontWeight: 700, 
        color: colors.cambridgeBlue,
        marginBottom: "20px"
      }}
    >
      StockSmart
    </Typography>
    <Button
      variant="contained"
      onClick={onEnter}
      style={{ backgroundColor: colors.gray, color: colors.black, marginBottom: "20px" }}
    >
      Go to Homepage
    </Button>
    <img 
      src={'/pantry.jpg'} 
      alt="Cover Image" 
      style={{ 
        width: '700px', 
        height: 'auto', 
        marginTop: '20px', 
        borderRadius: '20px',  
        boxShadow: '0 0 15px 10px rgba(8, 5, 4, 0.8)',  
      }} 
    />
  </Box>
);

const HomePage = () => {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('');
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

  const addItem = async (item, quantity, serialNumber, category) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: existingQuantity + quantity, serialNumber, category }, { merge: true });
    } else {
      await setDoc(docRef, { quantity, serialNumber, category });
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
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
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

  const handleOpen = () => {
    setItemName('');
    setItemQuantity(1);
    setSerialNumber('');
    setCategory('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const searchRecipe = (itemName) => {
    const query = `recipes with ${itemName}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <Box width="100vw" height="100vh" bgcolor={colors.black} color={colors.cambridgeBlue}>
      <AppBar position="static" style={{ backgroundColor: colors.darkSlateGray }}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1, fontFamily: "'Playfair Display', serif" }}>
            StockSmart
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Typography
          variant="h2"
          style={{ color: colors.cambridgeBlue, marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}
        >
          Manage Your Inventory
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2} marginBottom="1rem">
          <Button
            variant="contained"
            onClick={handleOpen}
            ref={buttonRef}
            style={{ backgroundColor: colors.gray, color: colors.black }}
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
                color: colors.black
              }
            }}
            ref={searchRef}
            style={{ width: '100%', maxWidth: '600px', backgroundColor: colors.cambridgeBlue }}
          />
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor={colors.cambridgeBlue}
            border={`2px solid ${colors.gray}`}
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
              transform: "translate(-50%, -50%)"
            }}
          >
            <Typography variant="h6" style={{ color: colors.darkSlateGray, fontFamily: "'Playfair Display', serif" }}>Add Items</Typography>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              label="Item Name"
            />
            <TextField
              variant="outlined"
              fullWidth
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
              label="Quantity"
            />
            <TextField
              variant="outlined"
              fullWidth
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              label="Serial Number"
            />
            <TextField
              variant="outlined"
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemQuantity, serialNumber, category);
                handleClose();
              }}
              style={{ borderColor: colors.darkSlateGray, color: colors.darkSlateGray }}
            >
              Add
            </Button>
          </Box>
        </Modal>
        <Box border={`1px solid ${colors.gray}`} mt={2} width="100%" maxWidth="800px" mx="auto">
          <Box width="100%" height="100px"
            bgcolor={colors.darkSlateGray} display="flex" alignItems="center" justifyContent="center"
          >
            <Typography variant="h2" style={{ color: colors.cambridgeBlue, fontFamily: "'Playfair Display', serif" }}>
              Inventory Items
            </Typography>
          </Box>
        </Box>
        <Stack width="100%" maxWidth="800px" spacing={2} overflow="auto" mt={2} mx="auto">
          {inventory.map(({ name, quantity, serialNumber, category }) => (
            <Box
              key={name}
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor={colors.darkSlateGray}
              padding={2}
              mb={2}
              borderRadius="8px"
            >
              <Typography variant="h6" style={{ color: colors.black, fontFamily: "'Playfair Display', serif" }} textAlign="center">
                {serialNumber}
              </Typography>
              <Typography variant="h6" style={{ color: colors.black, fontFamily: "'Playfair Display', serif" }} textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6" style={{ color: colors.black, fontFamily: "'Playfair Display', serif" }} textAlign="center">
                {quantity}
              </Typography>
              <Typography variant="h6" style={{ color: colors.black, fontFamily: "'Playfair Display', serif" }} textAlign="center">
                {category}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => addItem(name, 1, serialNumber, category)}
                  style={{ backgroundColor: colors.black, color: colors.cambridgeBlue }}
                  sx={animateCart[name] ? { animation: `${slide} 1s ease` } : {}}
                >
                  Add to cart <ShoppingCartIcon style={{ marginLeft: '8px' }} />
                </Button>
                <IconButton
                  onClick={() => removeItem(name)}
                  style={{ backgroundColor: colors.black, color: colors.cambridgeBlue }}
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  variant="contained"
                  onClick={() => searchRecipe(name)}
                  style={{ backgroundColor: colors.black, color: colors.cambridgeBlue }}
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
};

const App = () => {
  const [showCover, setShowCover] = useState(true);

  return showCover ? <CoverPage onEnter={() => setShowCover(false)} /> : <HomePage />;
};

export default App;
