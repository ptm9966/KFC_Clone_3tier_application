import "./home.css";
import React from 'react';
import { Carousels } from "../carousels/Carousels";
import { MenuCards } from "../MenuPageComponents/MenuCard";
import Offer from "../home_footer/Offer";
// import { Button } from '../main_button/Button';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Button, HStack, Text } from "@chakra-ui/react";

const Home = () => {

  const Auth = useSelector((store) => store.auth.isAuth);
  const finalItems = useSelector((store) => store.cart.finalItems);
  const finalPrice = useSelector((store) => store.cart.finalPrice);
  const lastOrder = JSON.parse(localStorage.getItem("lastOrder") || "null");
  console.log(Auth)
    const navigate= useNavigate()
  return (
    <>
     <HStack h="77px" bg="black" color="white" display="flex" fontSize={[12,13,16,20]} justifyContent="center" alignItems="center" flexWrap="wrap">
                <Text mr="2%">LET'S ORDER FOR DELIVERY, PICK UP, OR DINE-IN</Text>
                <Button onClick={() => { navigate('/menu') }} borderRadius="44px" ml="7px" bg="red" fontSize={[12,13,16,20]} _hover={{backgroundColor:"red"}}>Start Order</Button>
                <Button
                  onClick={() => { navigate('/cart') }}
                  borderRadius="44px"
                  ml="7px"
                  bg="white"
                  color="black"
                  fontSize={[12,13,16,20]}
                  _hover={{backgroundColor:"white"}}
                >
                  Cart ({finalItems}) - Rs. {finalPrice}
                </Button>
      </HStack>
      {/* <div className="black">
        <b>LET'S ORDER FOR DELIVERY, PICK UP, OR DINE-IN</b>

        <Button onClick={() => {
          navigate('/menu')
        }}>Start Order</Button>
      </div> */}

      <div className="slider">
        <Carousels
          img1={"./kgf.webp"}
          img2={"./banner2.webp"}
          img3={"./banner3.webp"}
          img4={"./banner4.webp"}
          img5={"./banner5.webp"}
        ></Carousels>
      </div>

      {lastOrder?.orderNo ? (
        <Box
          w="90%"
          m="24px auto"
          p="18px"
          bg="blackAlpha.100"
          borderLeft="5px solid #e4002b"
          textAlign="left"
        >
          <Text fontWeight="bold">Latest order: {lastOrder.orderNo}</Text>
          <Text color="gray.600">Status: {lastOrder.status || "Placed"}</Text>
          <Button mt="10px" bg="black" color="white" _hover={{ backgroundColor: "black" }} onClick={() => navigate("/signout")}>
            View Order History
          </Button>
        </Box>
      ) : null}

      <div className="userDiv">
        <img className="bandImg" src="./band.png" alt="" />
        <h1 className="welcome_text" style={{marginBottom:"2%"}}>
          WELCOME TO KING OF GOOD FOOD
        </h1>
      </div>

      <div className="home_menu">
        <h1 className="browse">BROWSE CATEGORIES</h1>
        <br />
        <div className="home_menu_item">
          <MenuCards img={"./hotdeals.jpg"} title={"HOT DEALS"} ></MenuCards>
          <MenuCards img={"./chickenbucket.jpg"} title={"CHICKEN BUCKETS"}></MenuCards>
          <MenuCards img={"./hotlauches.jpg"} title={"HOT LAUNCHES"}></MenuCards>
          <MenuCards img={"./boxmeal.jpg"} title={" BOX MEALS"}></MenuCards> 
        </div> 

        <div className="home_menu_item">
          <MenuCards img={"./burgers.jpg"} title={"BURGERS"}></MenuCards>
          <MenuCards img={"./biryanibucket.jpg"} title={"BIRIYANI BUCKETS"}></MenuCards>
          <MenuCards img={"./snack.jpg"} title={"SNACK"}></MenuCards>
          <MenuCards img={"./viewallmenu.svg"} title={"View All Menu"}></MenuCards>
        </div>

      </div>

      <Offer />
  
      
    </>
  )
}

export default Home
