import throttle from "lodash/throttle";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import BottomNav from "../../components/BottomNav";
import { Box } from "../../components/Box";
import Flex from "../../components/Box/Flex";
import Footer from "../../components/Footer";
import MenuItems from "../../components/MenuItems/MenuItems";
import { SubMenuItems } from "../../components/SubMenuItems";
import { useMatchBreakpoints } from "../../hooks";
import CakePrice from "../../components/CakePrice/CakePrice";
import Logo from "./components/Logo";
import { MENU_HEIGHT, MOBILE_MENU_HEIGHT, TOP_BANNER_HEIGHT, TOP_BANNER_HEIGHT_MOBILE } from "./config";
import { NavProps } from "./types";
import LangSelector from "../../components/LangSelector/LangSelector";
import Input from "../../components/Input/Input";
import InputGroup from "../../components/Input/InputGroup";
import Search from "../../components/Svg/Icons/Search";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledNav = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: right;
  width: 100%;
  height: 120px;
  background: transparent;
  // border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom: 1px solid #1e4150;
  transform: translate3d(0, 0, 0);

  // padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 16px;

  ${({theme}) => theme.mediaQueries.sm} {
    flex-direction: row;
    align-items: center;
    height: 95px;
  }
`;

const LogoSearchContainer = styled(Flex)`
  padding-top: 15px;
  ${({theme}) => theme.mediaQueries.sm} {
    padding-top: 0px;
    margin-bottom: 0px;
  }
`

const FixedContainer = styled.div<{ showMenu: boolean; height: number }>`
  position: fixed;
  top: ${({ showMenu, height }) => (showMenu ? 0 : `-${height}px`)};
  left: 0;
  transition: top 0.2s;
  height: ${({ height }) => `${height}px`};
  width: 100%;
  z-index: 20;
`;

const TopBannerContainer = styled.div<{ height: number }>`
  height: ${({ height }) => `${height}px`};
  min-height: ${({ height }) => `${height}px`};
  max-height: ${({ height }) => `${height}px`};
  width: 100%;
`;

const BodyWrapper = styled(Box)`
  position: relative;
  display: flex;
`;

const Inner = styled.div<{ isPushed: boolean; showMenu: boolean }>`
  flex-grow: 1;
  transition: margin-top 0.2s, margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate3d(0, 0, 0);
  max-width: 100%;
`;

const SearchContainer = styled.div`
  display: flex;
  width: 80%;
  align-items: center;
  margin-left: 0px;
  padding-left: 30px;
  padding-right: 10px;
  border-left: 1px solid #2d3551;
  ${({theme}) => theme.mediaQueries.md} {
    margin-left: 30px;
    padding-right: 10px;
  }
`

const SearchGroup = styled(InputGroup) `
  border: 1px solid #52555c;
  min-width: 200px;
`

const Menu: React.FC<NavProps> = ({
  userMenu,
  banner,
  globalMenu,
  searchItem,
  searchKey,
  setSearchKey,
  isDark,
  toggleTheme,
  currentLang,
  setLang,
  cakePriceUsd,
  links,
  subLinks,
  footerLinks,
  activeItem,
  activeSubItem,
  langs,
  buyCakeLabel,
  children,
}) => {
  const { isMobile, isTablet } = useMatchBreakpoints();
  const [showMenu, setShowMenu] = useState(true);
  const refPrevOffset = useRef(typeof window === "undefined" ? 0 : window.pageYOffset);

  const topBannerHeight = isMobile || isTablet ? TOP_BANNER_HEIGHT_MOBILE : TOP_BANNER_HEIGHT;

  const totalTopMenuHeight = banner ? MENU_HEIGHT + topBannerHeight : MENU_HEIGHT;

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight;
      const isTopOfPage = currentOffset === 0;
      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true);
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        if (currentOffset < refPrevOffset.current || currentOffset <= totalTopMenuHeight) {
          // Has scroll up
          setShowMenu(true);
        } else {
          // Has scroll down
          setShowMenu(false);
        }
      }
      refPrevOffset.current = currentOffset;
    };
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [totalTopMenuHeight]);

  // Find the home link if provided
  const homeLink = links.find((link) => link.label === "Home");

  const subLinksWithoutMobile = subLinks?.filter((subLink) => !subLink.isMobileOnly);
  const subLinksMobileOnly = subLinks?.filter((subLink) => subLink.isMobileOnly);

  return (
    <Wrapper>
      <FixedContainer showMenu={showMenu} height={totalTopMenuHeight}>
        {/* {banner && <TopBannerContainer height={topBannerHeight}>{banner}</TopBannerContainer>} */}
        <StyledNav>
          <LogoSearchContainer flex={8}>
            <Logo isDark={isDark} href={homeLink?.href ?? "/"} />
            <SearchContainer>
              <SearchGroup startItem={searchItem} endIcon={<Search width="24px"/>}>
                <Input type="text" placeholder="Enter token or wallet address" value={searchKey} onChange={setSearchKey}/>
              </SearchGroup>
            </SearchContainer>
            {(!isMobile && !isTablet) && <MenuItems items={links} activeItem={activeItem} activeSubItem={activeSubItem} ml="25px"/>}
          </LogoSearchContainer>
          <Flex alignItems="center" height="100%" flex={2} justifyContent="end">
            {/* {!isMobile && (
              <Box mr="12px">
                <CakePrice cakePriceUsd={cakePriceUsd} />
              </Box>
            )}
            <Box mt="4px">
              <LangSelector
                currentLang={currentLang}
                langs={langs}
                setLang={setLang}
                buttonScale="xs"
                color="textSubtle"
                hideLanguage
              />
            </Box> 
            {globalMenu} */} {userMenu}
          </Flex>
        </StyledNav>
      </FixedContainer>
      {subLinks && (
        <Flex justifyContent="space-around">
          <SubMenuItems items={subLinksWithoutMobile} mt={`${totalTopMenuHeight + 1}px`} activeItem={activeSubItem} />

          {subLinksMobileOnly?.length > 0 && (
            <SubMenuItems
              items={subLinksMobileOnly}
              mt={`${totalTopMenuHeight + 1}px`}
              activeItem={activeSubItem}
              isMobileOnly
            />
          )}
        </Flex>
      )}
      {/* <BodyWrapper mt={!subLinks ? `${totalTopMenuHeight + 1}px` : "0"}> */}
      <BodyWrapper mt={!subLinks ? `${totalTopMenuHeight + 1}px` : "0"}>
        <Inner isPushed={false} showMenu={showMenu}>
          {children}
          <Footer
            items={footerLinks}
            isDark={isDark}
            toggleTheme={toggleTheme}
            langs={langs}
            setLang={setLang}
            currentLang={currentLang}
            cakePriceUsd={cakePriceUsd}
            buyCakeLabel={buyCakeLabel}
            mb={[`${MOBILE_MENU_HEIGHT}px`, null, "0px"]}
          />
        </Inner>
      </BodyWrapper>
      {(isMobile || isTablet) && <BottomNav items={links} activeItem={activeItem} activeSubItem={activeSubItem} />}
    </Wrapper>
  );
};

export default Menu;
