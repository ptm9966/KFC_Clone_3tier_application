import { Box, Button, Image, Input, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authsaveData } from "../../utils/AuthLocaldata";
import logoeatmore1 from "../../logoeatmore1.jpg"
import { API_BASE_URL } from "../../config/api";

const CardPayment = () => {
     const [cartPayments, setCartPayments] = useState();
     const [cardNumber, setCardNumber] = useState("");
     const [isPlacingOrder, setIsPlacingOrder] = useState(false);
     const navigate = useNavigate();
     const toast = useToast();
     const user = useSelector((store) => store.auth.user);

     const handleCheckout = async () => {
          if (isPlacingOrder) {
               return;
          }

          let temp = cardHide(cardNumber);
          authsaveData("cardNumber", temp);

          try {
               setIsPlacingOrder(true);
               const response = await fetch(`${API_BASE_URL}/api/orders`, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                         userId: user?._id,
                         userName: user?.name,
                         userMobile: user?.mobile,
                         totalPrice: cartPayments,
                         paymentMethod: "Card",
                         clearCart: true,
                    }),
               });
               const data = await response.json();

               if (!response.ok) {
                    throw new Error(data.message || data.err || "Unable to place order");
               }

               localStorage.setItem("lastOrder", JSON.stringify(data.order));
               localStorage.setItem("totalcart", 0);
               navigate("/confirmation");
          } catch (error) {
               toast({
                    title: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
               });
          } finally {
               setIsPlacingOrder(false);
          }
     };
     function cardHide(card) {
          let hideNum = [];
          for (let i = 0; i < card.length; i++) {
               if (i < card.length - 4) {
                    hideNum.push("x");
               } else {
                    hideNum.push(card[i]);
               }
          }
          return hideNum.join("");
     }

     useEffect(() => {
          // let temp = authgetData("finalPrice");
          let temp = +localStorage.getItem("totalcart") || 0;
          setCartPayments(temp);
     }, []);

     return (
          <Box>
               <Box
                    p={5}
                    height={"500px"}
                    margin={"auto"}
                    width={"350px"}
                    boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px"
               >
                    <Box
                         display={"flex"}
                         justifyContent={"space-between"}
                         p={5}
                         backgroundColor="#F28E2E"
                         height={"150px"}
                         alignItems={"center"}
                    >
                         <Box
                              display={"flex"}
                              alignItems={"center"}
                              width={"80px"}
                              backgroundColor={"#fff"}
                              height={"80px"}
                              p={2}
                         >
                              <Image
                                   src={logoeatmore1}
                                   alt="img"
                              />
                         </Box>
                         <Box mr={"80px"} height={"70px"} p={2}>
                              <Text color={"white"} fontWeight={"bold"}>
                                   Total Price :
                              </Text>
                              <Text color={"white"} fontWeight={"bold"}>
                                   ₹ {cartPayments}
                              </Text>
                         </Box>
                    </Box>
                    <Text textAlign={"left"} p={5}>
                         Add New Card
                    </Text>
                    <Box display={"flex"} gap={"5px"}>
                         <Input
                              borderBottom={"1px solid black"}
                              placeholder="Card Number"
                              name="cardNumber"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              textDecoration={"none"}
                              borderRadius={"none"}
                              width={"60%"}
                         />
                         <Input
                              borderBottom={"1px solid black"}
                              placeholder="Expiry"
                              textDecoration={"none"}
                              borderRadius={"none"}
                              width={"60%"}
                         />
                    </Box>
                    <br />
                    <Box display={"flex"} gap={"5px"}>
                         <Input
                              borderBottom={"1px solid black"}
                              placeholder="Card Holder's name"
                              textDecoration={"none"}
                              borderRadius={"none"}
                              width={"60%"}
                         />
                         <Input
                              borderBottom={"1px solid black"}
                              placeholder="CVV"
                              textDecoration={"none"}
                              borderRadius={"none"}
                              width={"60%"}
                         />
                    </Box>
                    <Button mt={10} onClick={handleCheckout} isLoading={isPlacingOrder}>
                         Checkout
                    </Button>
               </Box>
          </Box>
     )
}

export default CardPayment;
