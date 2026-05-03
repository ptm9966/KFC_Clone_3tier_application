import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  RadioGroup,
  Button,
  Flex,
  Center,
  Grid,
  Text,
  Box,
} from "@chakra-ui/react";
import React from "react";
import { Stack } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Sidebar({ items, price, handleClick,handleClick2, ID, name,userName }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [placement, setPlacement] = React.useState("top");

  const handleClicked1=(e)=>{
    onClose();
    handleClick(e);
  }

  const handleClicked2=(e)=>{
    onClose();
    handleClick2(e);
  }

  return (
    <>
      <RadioGroup defaultValue={placement} onChange={setPlacement}>
        <Stack direction="row" mb="4"></Stack>
      </RadioGroup>
      <Button
        w="50px"
        position='absolute'
        right="5%"
        bottom={'20%'}
        colorScheme="red"
        bgColor="black"
        color="white"
        onClick={onOpen}
      >
        <HamburgerIcon w="50px" />{" "}
      </Button>
      <Drawer placement={placement} onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Flex justifyContent="space-around">
              {/* <Flex border="2px solid red"> */}
                <Center w="50%">
                  
                  <span style={{marginRight:"5%",marginTop:"2%"}}>
                    <img src="/login2.png" alt="profileLogo"  />
                  </span>

                  <Text onClick={onClose}>
                  <Link className="link" to={userName ? "/signout" : "/login"} >
                  {userName ? userName : "Login"}
                  </Link>
                  </Text>
                  
                  <Box borderLeft="4px solid black" m="5%" height="22px"></Box>
                  {/* <Link
                    className="link"
                    onClick={onClose}
                    to={ID ? "/" : "/signup"}
                  >
                    {name}
                  </Link>
                  {ID ? (
                    <Link onClick={onClose}>
                      <Button
                        colorScheme="red"
                        onClick={handleClick2}
                        color="white"
                        bgColor="black"
                      >
                        Signout
                      </Button>
                    </Link>
                  ) : (
                    ""
                  )}{" "} */}
                  {userName ? (
              <Button
                colorScheme="grey"
                onClick={handleClicked2}
                color="white"
                bgColor="black"
              >
                Signout
              </Button>
            ) : (
              <Link to={"/signup"}>
              <Button
                colorScheme="grey"
                onClick={handleClicked1}
                color="white"
                bgColor="black"
                marginTop={'0%'}
              >
                Signup
              </Button>
            </Link>
            )}
                </Center>
              {/* </Flex> */}

              {/* <Flex> */}
                <Flex w="50%" justifyContent='end' alignItems={'center'} position={"relative"}>
                  <Link to="/cart" onClick={onClose}>
                    <Button bg="#e4002b" color="white" borderRadius="24px" _hover={{ bg: "#c90026" }}>
                      Cart ({items}) - ₹{price}
                    </Button>
                  </Link>{" "}
                </Flex>
              {/* </Flex> */}
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Center>
              <Grid gap="20px">
                <Button bgColor="grey">
                  <Link className="link" to="/menu" onClick={onClose}>
                    Menu
                  </Link>
                </Button>
                <Button bgColor="gray">
                  <Link className="link" to="/deals" onClick={onClose}>
                    Deals
                  </Link>
                  {" "}
                </Button>{" "}
              </Grid>
            </Center>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
