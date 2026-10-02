import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./LayoutMap.css";
import { supabase } from "../services/supabase";

const SVG_URL = "/layout.svg";
const DIMENSIONS_URL = "/plot-dimensions.txt";

const TOTAL_PLOTS = 272;
const SVG_WIDTH = 1191;
const SVG_HEIGHT = 1684;

const MIN_ZOOM = 1;
const MAX_ZOOM = 12;
const BUTTON_ZOOM_FACTOR = 1.25;

// Actual plot-area polygons used ONLY for status coloring.
// The original SVG artwork, positions, labels, zoom and Supabase logic remain unchanged.
const PLOT_POLYGONS = {"1":[[237.75,511.75],[234.75,553.25],[284.5,553.25],[284.25,513.0]],"214":[[237.75,511.75],[234.75,553.25],[284.5,553.25],[284.25,513.0]],"2":[[234.75,555.0],[232.0,596.5],[284.5,596.5],[284.5,555.0]],"3":[[231.75,598.0],[229.75,628.75],[284.5,628.75],[284.5,598.0]],"4":[[229.5,630.5],[227.5,661.0],[284.5,661.0],[284.5,630.5]],"5":[[227.25,663.0],[225.25,693.5],[284.5,693.5],[284.5,662.75]],"6":[[225.25,695.25],[223.0,725.75],[284.5,725.75],[284.5,695.25]],"198":[[225.25,695.25],[223.0,725.75],[284.5,725.75],[284.5,695.25]],"7":[[223.0,727.5],[220.75,758.25],[284.5,758.25],[284.5,727.5]],"205":[[223.0,727.5],[220.75,758.25],[284.5,758.25],[284.5,727.5]],"9":[[218.75,792.25],[218.0,822.75],[284.5,822.75],[284.5,792.25]],"8":[[220.75,759.75],[218.75,790.5],[284.5,790.5],[284.5,759.75]],"10":[[218.0,824.5],[217.5,855.0],[284.5,855.0],[284.5,824.5]],"11":[[217.5,856.75],[216.5,898.25],[284.5,898.25],[284.5,856.75]],"12":[[216.5,900.0],[216.0,924.0],[284.5,924.0],[284.5,900.0]],"13":[[216.0,925.75],[215.25,967.25],[284.5,967.25],[284.5,925.75]],"14":[[215.0,969.0],[214.5,1005.0],[284.5,1005.0],[284.5,969.0]],"265":[[215.0,969.0],[214.5,1005.0],[284.5,1005.0],[284.5,969.0]],"15":[[214.25,1006.75],[213.5,1042.75],[284.5,1042.75],[284.5,1006.75]],"16":[[213.5,1044.5],[212.75,1080.5],[284.5,1080.5],[284.5,1044.5]],"17":[[212.75,1082.25],[212.25,1118.25],[284.5,1118.25],[284.5,1082.25]],"18":[[212.5,1120.0],[214.75,1150.5],[284.5,1150.5],[284.5,1120.0]],"19":[[214.75,1152.25],[218.0,1193.75],[284.5,1193.75],[284.5,1152.25]],"21":[[220.0,1221.25],[223.0,1262.75],[284.5,1262.75],[284.5,1221.25]],"20":[[218.0,1195.5],[219.75,1219.5],[284.5,1219.5],[284.5,1195.5]],"171":[[218.0,1195.5],[219.75,1219.5],[284.5,1219.5],[284.5,1195.5]],"22":[[223.25,1264.5],[226.0,1305.75],[284.5,1305.75],[284.5,1264.5]],"23":[[226.25,1307.5],[228.25,1338.25],[284.5,1338.25],[284.5,1307.5]],"189":[[226.25,1307.5],[228.25,1338.25],[284.5,1338.25],[284.5,1307.5]],"24":[[228.25,1340.0],[230.0,1365.0],[284.5,1365.0],[284.5,1340.0]],"150":[[228.25,1340.0],[230.0,1365.0],[284.5,1365.0],[284.5,1340.0]],"25":[[230.0,1366.75],[231.75,1392.0],[284.5,1392.0],[284.5,1366.75]],"26":[[232.0,1393.75],[234.0,1424.5],[284.5,1424.5],[284.5,1393.75]],"27":[[234.0,1426.0],[237.0,1467.5],[284.5,1467.5],[284.5,1426.0]],"28":[[237.0,1469.25],[239.5,1505.75],[284.5,1504.25],[284.5,1469.25]],"29":[[312.5,1469.25],[312.5,1500.0],[359.25,1498.5],[359.25,1469.25]],"151":[[312.5,1469.25],[312.5,1500.0],[359.25,1498.5],[359.25,1469.25]],"30":[[312.5,1426.0],[312.5,1467.5],[359.25,1467.5],[359.25,1426.0]],"200":[[312.5,1426.0],[312.5,1467.5],[359.25,1467.5],[359.25,1426.0]],"31":[[312.5,1393.75],[312.5,1424.5],[359.25,1424.5],[359.25,1393.75]],"32":[[312.5,1366.75],[312.5,1392.0],[359.25,1392.0],[359.25,1366.75]],"125":[[312.5,1366.75],[312.5,1392.0],[359.25,1392.0],[359.25,1366.75]],"33":[[312.5,1345.25],[312.5,1365.0],[359.25,1365.0],[359.25,1345.25]],"100":[[312.5,1345.25],[312.5,1365.0],[359.25,1365.0],[359.25,1345.25]],"34":[[312.5,1323.75],[312.5,1343.75],[359.25,1343.75],[359.25,1323.75]],"35":[[312.5,1296.75],[312.5,1322.0],[359.25,1322.0],[359.25,1296.75]],"36":[[312.5,1264.5],[312.5,1295.0],[359.25,1295.0],[359.25,1264.5]],"37":[[312.5,1221.5],[312.5,1262.75],[359.25,1262.75],[359.25,1221.5]],"44":[[312.5,1001.25],[312.5,1026.5],[359.25,1026.5],[359.25,1001.25]],"45":[[312.5,969.0],[312.5,999.5],[359.25,999.5],[359.25,969.0]],"46":[[312.5,926.0],[312.5,967.25],[359.25,967.25],[359.25,926.0]],"38":[[312.5,1152.25],[312.5,1193.5],[359.25,1193.5],[359.25,1152.25]],"39":[[312.5,1120.0],[312.5,1150.5],[359.25,1150.5],[359.25,1120.0]],"40":[[312.5,1093.0],[312.5,1118.25],[359.25,1118.25],[359.25,1093.0]],"41":[[312.5,1071.25],[312.5,1091.25],[359.25,1091.25],[359.25,1071.25]],"42":[[312.5,1049.75],[312.5,1069.75],[359.25,1069.75],[359.25,1049.75]],"43":[[312.5,1028.25],[312.5,1048.25],[359.25,1048.25],[359.25,1028.25]],"70":[[361.0,1001.25],[361.0,1026.5],[407.5,1026.5],[407.5,1001.25]],"69":[[361.0,969.0],[361.0,999.5],[407.5,999.5],[407.5,969.0]],"68":[[361.0,926.0],[361.0,967.25],[407.5,967.25],[407.5,926.0]],"76":[[361.0,1152.25],[361.0,1193.5],[407.5,1193.5],[407.5,1152.25]],"75":[[361.0,1120.0],[361.0,1150.5],[407.5,1150.5],[407.5,1120.0]],"74":[[361.0,1093.0],[361.0,1118.25],[407.5,1118.25],[407.5,1093.0]],"73":[[361.0,1071.25],[361.0,1091.25],[407.5,1091.25],[407.5,1071.25]],"72":[[361.0,1049.75],[361.0,1069.75],[407.5,1069.75],[407.5,1049.75]],"71":[[361.0,1028.25],[361.0,1048.25],[407.5,1048.25],[407.5,1028.25]],"101":[[435.5,1001.25],[435.5,1026.5],[482.0,1026.5],[482.0,1001.25]],"102":[[435.5,969.0],[435.5,999.5],[482.0,999.5],[482.0,969.0]],"103":[[435.5,926.0],[435.5,967.25],[482.0,967.25],[482.0,926.0]],"95":[[435.5,1152.25],[435.5,1193.5],[482.0,1193.5],[482.0,1152.25]],"96":[[435.5,1120.0],[435.5,1150.5],[482.0,1150.5],[482.0,1120.0]],"97":[[435.5,1093.0],[435.5,1118.25],[482.0,1118.25],[482.0,1093.0]],"98":[[435.5,1071.25],[435.5,1091.25],[482.0,1091.25],[482.0,1071.25]],"99":[[435.5,1049.75],[435.5,1069.75],[482.0,1069.75],[482.0,1049.75]],"121":[[483.75,1001.25],[483.75,1026.5],[530.5,1026.5],[530.5,1001.25]],"120":[[483.75,969.0],[483.75,999.5],[530.5,999.5],[530.5,969.0]],"119":[[483.75,926.0],[483.75,967.25],[530.5,967.25],[530.5,926.0]],"127":[[483.75,1152.25],[483.75,1193.5],[530.5,1193.5],[530.5,1152.25]],"126":[[483.75,1120.0],[483.75,1150.5],[530.5,1150.5],[530.5,1120.0]],"124":[[483.75,1071.25],[483.75,1091.25],[530.5,1091.25],[530.5,1071.25]],"123":[[483.75,1049.75],[483.75,1069.75],[530.5,1069.75],[530.5,1049.75]],"122":[[483.75,1028.25],[483.75,1048.25],[530.5,1048.25],[530.5,1028.25]],"152":[[558.25,969.0],[558.25,999.5],[605.0,999.5],[605.0,969.0]],"153":[[558.25,926.0],[558.25,967.25],[605.0,967.25],[605.0,926.0]],"145":[[558.25,1152.25],[558.25,1193.5],[605.0,1193.5],[605.0,1152.25]],"146":[[558.25,1120.0],[558.25,1150.5],[605.0,1150.5],[605.0,1120.0]],"147":[[558.25,1093.0],[558.25,1118.25],[605.0,1118.25],[605.0,1093.0]],"148":[[558.25,1071.25],[558.25,1091.25],[605.0,1091.25],[605.0,1071.25]],"149":[[558.25,1049.75],[558.25,1069.75],[605.0,1069.75],[605.0,1049.75]],"168":[[606.75,1001.25],[606.75,1026.5],[653.25,1026.5],[653.25,1001.25]],"167":[[606.75,969.0],[606.75,999.5],[653.25,999.5],[653.25,969.0]],"166":[[606.75,926.0],[606.75,967.25],[653.25,967.25],[653.25,926.0]],"174":[[606.75,1152.25],[606.75,1193.5],[653.25,1193.5],[653.25,1152.25]],"173":[[606.75,1120.0],[606.75,1150.5],[653.25,1150.5],[653.25,1120.0]],"172":[[606.75,1093.0],[606.75,1118.25],[653.25,1118.25],[653.25,1093.0]],"170":[[606.75,1049.75],[606.75,1069.75],[653.25,1069.75],[653.25,1049.75]],"169":[[606.75,1028.25],[606.75,1048.25],[653.25,1048.25],[653.25,1028.25]],"84":[[361.0,1426.0],[361.0,1467.5],[407.5,1467.5],[407.5,1426.0]],"83":[[361.0,1393.75],[361.0,1424.5],[407.5,1424.5],[407.5,1393.75]],"82":[[361.0,1366.75],[361.0,1392.0],[407.5,1392.0],[407.5,1366.75]],"81":[[361.0,1345.25],[361.0,1365.0],[407.5,1365.0],[407.5,1345.25]],"80":[[361.0,1323.75],[361.0,1343.75],[407.5,1343.75],[407.5,1323.75]],"79":[[361.0,1296.75],[361.0,1322.0],[407.5,1322.0],[407.5,1296.75]],"78":[[361.0,1264.5],[361.0,1295.0],[407.5,1295.0],[407.5,1264.5]],"77":[[361.0,1221.5],[361.0,1262.75],[407.5,1262.75],[407.5,1221.5]],"87":[[435.5,1426.0],[435.5,1456.75],[482.0,1456.75],[482.0,1426.0]],"88":[[435.5,1393.75],[435.5,1424.5],[482.0,1424.5],[482.0,1393.75]],"89":[[435.5,1366.75],[435.5,1392.0],[482.0,1392.0],[482.0,1366.75]],"90":[[435.5,1345.25],[435.5,1365.0],[482.0,1365.0],[482.0,1345.25]],"91":[[435.5,1323.75],[435.5,1343.75],[482.0,1343.75],[482.0,1323.75]],"92":[[435.5,1296.75],[435.5,1322.0],[482.0,1322.0],[482.0,1296.75]],"93":[[435.5,1264.5],[435.5,1295.0],[482.0,1295.0],[482.0,1264.5]],"94":[[435.5,1221.5],[435.5,1262.75],[482.0,1262.75],[482.0,1221.5]],"135":[[483.75,1426.0],[483.75,1456.75],[530.5,1456.75],[530.5,1426.0]],"134":[[483.75,1393.75],[483.75,1424.5],[530.5,1424.5],[530.5,1393.75]],"133":[[483.75,1366.75],[483.75,1392.0],[530.5,1392.0],[530.5,1366.75]],"132":[[483.75,1345.25],[483.75,1365.0],[530.5,1365.0],[530.5,1345.25]],"131":[[483.75,1323.75],[483.75,1343.75],[530.5,1343.75],[530.5,1323.75]],"130":[[483.75,1296.75],[483.75,1322.0],[530.5,1322.0],[530.5,1296.75]],"129":[[483.75,1264.5],[483.75,1295.0],[530.5,1295.0],[530.5,1264.5]],"128":[[483.75,1221.5],[483.75,1262.75],[530.5,1262.75],[530.5,1221.5]],"47":[[312.5,856.75],[312.5,898.0],[359.25,898.0],[359.25,856.75]],"67":[[361.0,856.75],[361.0,898.0],[407.5,898.0],[407.5,856.75]],"48":[[312.5,824.5],[312.5,855.0],[359.25,855.0],[359.25,824.5]],"66":[[361.0,824.5],[361.0,855.0],[407.5,855.0],[407.5,824.5]],"49":[[312.5,797.5],[312.5,822.75],[359.25,822.75],[359.25,797.5]],"65":[[361.0,797.5],[361.0,822.75],[407.5,822.75],[407.5,797.5]],"50":[[312.5,776.0],[312.5,795.75],[359.25,795.75],[359.25,776.0]],"64":[[361.0,776.0],[361.0,795.75],[407.5,795.75],[407.5,776.0]],"51":[[312.5,754.5],[312.5,774.25],[359.25,774.25],[359.25,754.5]],"63":[[361.0,754.5],[361.0,774.25],[407.5,774.25],[407.5,754.5]],"52":[[312.5,732.75],[312.5,752.75],[359.25,752.75],[359.25,732.75]],"62":[[361.0,732.75],[361.0,752.75],[407.5,752.75],[407.5,732.75]],"53":[[312.5,711.25],[312.5,731.25],[359.25,731.25],[359.25,711.25]],"61":[[361.0,711.25],[361.0,731.25],[407.5,731.25],[407.5,711.25]],"54":[[312.5,684.25],[312.5,709.5],[359.25,709.5],[359.25,684.25]],"60":[[361.0,684.25],[361.0,709.5],[407.5,709.5],[407.5,684.25]],"55":[[312.5,652.0],[312.5,682.75],[359.25,682.75],[359.25,652.0]],"59":[[361.0,652.0],[361.0,682.75],[407.5,682.75],[407.5,652.0]],"56":[[312.5,608.75],[312.5,650.25],[359.25,650.25],[359.25,608.75]],"58":[[361.0,589.25],[361.0,650.25],[407.5,650.25],[407.5,591.0],[405.0,589.25]],"57":[[312.5,556.25],[312.5,607.25],[359.25,607.25],[359.25,558.25],[356.0,556.25]],"240":[[312.5,556.25],[312.5,607.25],[359.25,607.25],[359.25,558.25],[356.0,556.25]],"104":[[435.5,856.75],[435.5,898.0],[482.0,898.0],[482.0,856.75]],"118":[[483.75,856.75],[483.75,898.0],[530.5,898.0],[530.5,856.75]],"105":[[435.5,824.5],[435.5,855.0],[482.0,855.0],[482.0,824.5]],"117":[[483.75,824.5],[483.75,855.0],[530.5,855.0],[530.5,824.5]],"106":[[435.5,797.5],[435.5,822.75],[482.0,822.75],[482.0,797.5]],"116":[[483.75,797.5],[483.75,822.75],[530.5,822.75],[530.5,797.5]],"107":[[435.5,776.0],[435.5,795.75],[482.0,795.75],[482.0,776.0]],"115":[[483.75,776.0],[483.75,795.75],[530.5,795.75],[530.5,776.0]],"154":[[558.25,856.75],[558.25,898.0],[605.0,898.0],[605.0,856.75]],"165":[[606.75,856.75],[606.75,898.0],[653.25,898.0],[653.25,856.75]],"155":[[558.25,824.5],[558.25,855.0],[605.0,855.0],[605.0,824.5]],"164":[[606.75,824.5],[606.75,855.0],[653.25,855.0],[653.25,824.5]],"156":[[558.25,797.5],[558.25,822.75],[605.0,822.75],[605.0,797.5]],"163":[[606.75,797.5],[606.75,822.75],[653.25,822.75],[653.25,797.5]],"157":[[558.25,776.0],[558.25,795.75],[605.0,795.75],[605.0,776.0]],"162":[[606.75,776.0],[606.75,795.75],[653.25,795.75],[653.25,776.0]],"209":[[729.75,856.75],[729.75,898.0],[776.25,898.0],[776.25,856.75]],"201":[[681.25,824.5],[681.25,855.0],[728.0,855.0],[728.0,824.5]],"208":[[729.75,824.5],[729.75,855.0],[776.25,855.0],[776.25,824.5]],"202":[[681.25,797.5],[681.25,822.75],[728.0,822.75],[728.0,797.5]],"207":[[729.75,797.5],[729.75,822.75],[776.25,822.75],[776.25,797.5]],"203":[[681.25,765.25],[681.25,795.75],[728.0,795.75],[728.0,765.25]],"206":[[729.75,765.25],[729.75,795.75],[776.25,795.75],[776.25,765.25]],"204":[[681.25,717.75],[681.25,763.5],[728.0,763.5],[728.0,719.5]],"220":[[681.25,717.75],[681.25,763.5],[728.0,763.5],[728.0,719.5]],"158":[[558.25,749.0],[558.25,774.25],[605.0,774.25],[605.0,749.0]],"161":[[606.75,749.0],[606.75,774.25],[653.25,774.25],[653.25,749.0]],"159":[[558.25,706.0],[558.25,747.25],[605.0,747.25],[605.0,709.5],[581.5,707.75],[578.75,706.0]],"160":[[606.75,711.75],[606.75,747.25],[653.25,747.25],[653.25,713.5]],"108":[[435.5,749.0],[435.5,774.25],[482.0,774.25],[482.0,749.0]],"114":[[483.75,749.0],[483.75,774.25],[530.5,774.25],[530.5,749.0]],"109":[[435.5,716.75],[435.5,747.25],[482.0,747.25],[482.0,716.75]],"113":[[483.75,716.75],[483.75,747.25],[530.5,747.25],[530.5,716.75]],"110":[[435.5,684.25],[435.5,715.0],[482.0,715.0],[482.0,684.25]],"111":[[435.5,641.25],[435.5,682.75],[482.0,682.75],[482.0,642.75],[479.75,641.25]],"112":[[483.75,673.5],[483.75,715.0],[530.5,715.0],[530.25,674.75]],"85":[[361.0,1469.25],[361.0,1496.5],[407.5,1494.75],[407.5,1469.25]],"86":[[435.5,1458.5],[435.5,1490.75],[482.0,1489.25],[482.0,1458.5]],"136":[[483.75,1458.5],[483.75,1488.0],[530.5,1486.5],[530.5,1458.5]],"137":[[558.25,1426.0],[558.25,1483.75],[605.0,1482.0],[605.0,1426.0]],"138":[[558.25,1393.75],[558.25,1424.5],[605.0,1424.5],[605.0,1393.75]],"182":[[606.75,1426.0],[606.75,1480.0],[653.25,1478.25],[653.25,1426.0]],"257":[[606.75,1426.0],[606.75,1480.0],[653.25,1478.25],[653.25,1426.0]],"181":[[606.75,1393.75],[606.75,1424.5],[653.25,1424.5],[653.25,1393.75]],"139":[[558.25,1366.75],[558.25,1392.0],[605.0,1392.0],[605.0,1366.75]],"180":[[606.75,1366.75],[606.75,1392.0],[653.25,1392.0],[653.25,1366.75]],"140":[[558.25,1345.25],[558.25,1365.0],[605.0,1365.0],[605.0,1345.25]],"141":[[558.25,1323.75],[558.25,1343.75],[605.0,1343.75],[605.0,1323.75]],"142":[[558.25,1296.75],[558.25,1322.0],[605.0,1322.0],[605.0,1296.75]],"143":[[558.25,1264.5],[558.25,1295.0],[605.0,1295.0],[605.0,1264.5]],"144":[[558.25,1221.5],[558.25,1262.75],[605.0,1262.75],[605.0,1221.5]],"179":[[606.75,1345.25],[606.75,1365.0],[653.25,1365.0],[653.25,1345.25]],"178":[[606.75,1323.75],[606.75,1343.75],[653.25,1343.75],[653.25,1323.75]],"177":[[606.75,1296.75],[606.75,1322.0],[653.25,1322.0],[653.25,1296.75]],"176":[[606.75,1264.5],[606.75,1295.0],[653.25,1295.0],[653.25,1264.5]],"175":[[606.75,1221.5],[606.75,1262.75],[653.25,1262.75],[653.25,1221.5]],"183":[[681.25,1426.0],[681.25,1475.5],[728.0,1473.75],[728.0,1426.0]],"226":[[729.75,1426.0],[729.75,1473.5],[776.25,1471.75],[776.25,1426.0]],"225":[[729.75,1426.0],[729.75,1473.5],[776.25,1471.75],[776.25,1426.0]],"184":[[681.25,1393.75],[681.25,1424.5],[728.0,1424.5],[728.0,1393.75]],"185":[[681.25,1366.75],[681.25,1392.0],[728.0,1392.0],[728.0,1366.75]],"186":[[681.25,1345.25],[681.25,1365.0],[728.0,1365.0],[728.0,1345.25]],"187":[[681.25,1323.75],[681.25,1343.75],[728.0,1343.75],[728.0,1323.75]],"188":[[681.25,1296.75],[681.25,1322.0],[728.0,1322.0],[728.0,1296.75]],"190":[[681.25,1221.5],[681.25,1262.75],[728.0,1262.75],[728.0,1221.5]],"224":[[729.75,1366.75],[729.75,1392.0],[776.25,1392.0],[776.25,1366.75]],"223":[[729.75,1345.25],[729.75,1365.0],[776.25,1365.0],[776.25,1345.25]],"222":[[729.75,1323.75],[729.75,1343.75],[776.25,1343.75],[776.25,1323.75]],"221":[[729.75,1296.75],[729.75,1322.0],[776.25,1322.0],[776.25,1296.75]],"219":[[729.75,1221.5],[729.75,1262.75],[776.25,1262.75],[776.25,1221.5]],"197":[[681.25,1001.25],[681.25,1026.5],[728.0,1026.5],[728.0,1001.25]],"199":[[681.25,926.0],[681.25,967.25],[728.0,967.25],[728.0,926.0]],"191":[[681.25,1152.25],[681.25,1193.5],[728.0,1193.5],[728.0,1152.25]],"192":[[681.25,1120.0],[681.25,1150.5],[728.0,1150.5],[728.0,1120.0]],"193":[[681.25,1093.0],[681.25,1118.25],[728.0,1118.25],[728.0,1093.0]],"194":[[681.25,1071.25],[681.25,1091.25],[728.0,1091.25],[728.0,1071.25]],"195":[[681.25,1049.75],[681.25,1069.75],[728.0,1069.75],[728.0,1049.75]],"196":[[681.25,1028.25],[681.25,1048.25],[728.0,1048.25],[728.0,1028.25]],"212":[[729.75,1001.25],[729.75,1026.5],[776.25,1026.5],[776.25,1001.25]],"211":[[729.75,969.0],[729.75,999.5],[776.25,999.5],[776.25,969.0]],"210":[[729.75,926.0],[729.75,967.25],[776.25,967.25],[776.25,926.0]],"218":[[729.75,1152.25],[729.75,1193.5],[776.25,1193.5],[776.25,1152.25]],"217":[[729.75,1120.0],[729.75,1150.5],[776.25,1150.5],[776.25,1120.0]],"216":[[729.75,1093.0],[729.75,1118.25],[776.25,1118.25],[776.25,1093.0]],"215":[[729.75,1071.25],[729.75,1091.25],[776.25,1091.25],[776.25,1071.25]],"213":[[729.75,1028.25],[729.75,1048.25],[776.25,1048.25],[776.25,1028.25]],"234":[[804.25,1001.25],[804.25,1026.5],[850.75,1026.5],[850.75,1001.25]],"235":[[804.25,969.0],[804.25,999.5],[850.75,999.5],[850.75,969.0]],"236":[[804.25,926.0],[804.25,967.25],[850.75,967.25],[850.75,926.0]],"231":[[804.25,1071.25],[804.25,1091.25],[850.75,1091.25],[850.75,1071.25]],"232":[[804.25,1049.75],[804.25,1069.75],[850.75,1069.75],[850.75,1049.75]],"233":[[804.25,1028.25],[804.25,1048.25],[850.75,1048.25],[850.75,1028.25]],"249":[[852.5,1001.25],[852.5,1026.5],[899.25,1026.5],[899.25,1001.25]],"248":[[852.5,969.0],[852.5,999.5],[899.25,999.5],[899.25,969.0]],"247":[[852.5,926.0],[852.5,967.25],[899.25,967.25],[899.25,926.0]],"252":[[852.5,1071.25],[852.5,1091.25],[899.25,1091.25],[899.25,1071.25]],"251":[[852.5,1049.75],[852.5,1069.75],[899.25,1069.75],[899.25,1049.75]],"250":[[852.5,1028.25],[852.5,1048.25],[899.25,1048.25],[899.25,1028.25]],"256":[[927.0,1001.25],[927.0,1026.5],[973.75,1026.5],[973.75,1001.25]],"258":[[927.0,926.0],[927.0,967.25],[973.75,967.25],[973.75,926.0]],"253":[[927.0,1071.25],[927.0,1089.5],[973.75,1091.0],[973.75,1071.25]],"254":[[927.0,1049.75],[927.0,1069.75],[973.75,1069.75],[973.75,1049.75]],"255":[[927.0,1028.25],[927.0,1048.25],[973.75,1048.25],[973.75,1028.25]],"269":[[975.5,1001.25],[975.5,1026.5],[1022.0,1026.5],[1022.0,1001.25]],"268":[[975.5,969.0],[975.5,999.5],[1022.0,999.5],[1022.0,969.0]],"267":[[975.5,926.0],[975.5,967.25],[1022.0,967.25],[1022.0,926.0]],"272":[[975.5,1071.25],[975.5,1091.0],[1022.0,1091.25],[1022.0,1071.25]],"271":[[975.5,1049.75],[975.5,1069.75],[1022.0,1069.75],[1022.0,1049.75]],"270":[[975.5,1028.25],[975.5,1048.25],[1022.0,1048.25],[1022.0,1028.25]],"228":[[804.25,1221.5],[804.25,1262.75],[842.0,1262.75],[856.0,1221.5]],"227":[[804.25,1264.5],[804.25,1301.0],[828.75,1301.0],[841.25,1264.5]],"237":[[804.25,856.75],[804.25,898.0],[850.75,898.0],[850.75,856.75]],"238":[[804.25,824.5],[804.25,855.0],[850.75,855.0],[850.75,824.5]],"246":[[852.5,856.75],[852.5,898.0],[899.25,898.0],[899.25,856.75]],"245":[[852.5,824.5],[852.5,855.0],[899.25,855.0],[899.25,824.5]],"239":[[804.25,803.0],[804.25,822.75],[850.75,822.75],[850.75,803.0]],"244":[[852.5,803.0],[852.5,822.75],[899.25,822.75],[899.25,803.0]],"243":[[852.5,776.0],[852.5,801.25],[899.25,801.25],[899.25,776.0]],"241":[[804.25,727.75],[804.25,774.25],[850.75,774.25],[850.75,729.5]],"242":[[852.5,731.75],[852.5,774.25],[899.25,774.25],[899.25,733.5]],"259":[[927.0,856.75],[927.0,898.0],[973.75,898.0],[973.75,856.75]],"266":[[975.5,856.75],[975.5,898.0],[1022.0,898.0],[1022.0,856.75]],"260":[[927.0,824.5],[927.0,855.0],[973.75,855.0],[973.75,824.5]],"261":[[927.0,797.5],[927.0,822.75],[973.75,822.75],[973.75,797.5]],"264":[[975.5,797.5],[975.5,822.75],[1022.0,822.75],[1022.0,797.5]],"262":[[927.0,735.75],[927.0,795.75],[973.75,795.75],[973.75,739.75]],"263":[[975.5,740.0],[975.5,795.75],[1022.0,795.75],[1022.0,755.5],[1010.25,746.0]],"230":[[804.25,1142.5],[883.25,1142.5],[899.25,1093.0],[804.25,1093.0]],"229":[[804.25,1144.25],[804.25,1193.5],[865.75,1193.5],[882.75,1144.25]]};

const STATUS_META = {
  available: {
    label: "Available",
    fill: "#00A83B",
    stroke: "#006B25",
  },
  booked: {
    label: "Booked",
    fill: "#FF8C00",
    stroke: "#B85C00",
  },
  sold: {
    label: "Sold",
    fill: "#E60000",
    stroke: "#990000",
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeStatus(status) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (
    value.includes("sold") ||
    value.includes("registered") ||
    value.includes("sale completed")
  ) {
    return "sold";
  }

  if (value.includes("book") || value.includes("reserv")) {
    return "booked";
  }

  return "available";
}

function databaseStatus(status) {
  return STATUS_META[normalizeStatus(status)].label;
}

function createInitialStatuses() {
  const result = {};

  for (let i = 1; i <= TOTAL_PLOTS; i += 1) {
    result[i] = "available";
  }

  return result;
}

function createDefaultDimensions() {
  const result = {};

  for (let i = 1; i <= TOTAL_PLOTS; i += 1) {
    result[i] = {
      length: null,
      breadth: null,
    };
  }

  return result;
}

function parseDimensionsText(text) {
  const result = {};

  if (!text) return result;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(
      /Plot\s*(\d+)\s*[-–—:]?\s*Length\s*:\s*([\d.]+)\s*ft\s*,?\s*Breadth\s*:\s*([\d.]+)\s*ft/i
    );

    if (!match) continue;

    const plotNumber = Number(match[1]);
    const length = Number(match[2]);
    const breadth = Number(match[3]);

    if (
      Number.isInteger(plotNumber) &&
      plotNumber >= 1 &&
      plotNumber <= TOTAL_PLOTS &&
      Number.isFinite(length) &&
      Number.isFinite(breadth)
    ) {
      result[plotNumber] = {
        length,
        breadth,
      };
    }
  }

  return result;
}

function getNumericText(element) {
  if (!element) return null;

  const text = (element.textContent || "")
    .replace(/\s+/g, "")
    .trim();

  if (!/^\d+$/.test(text)) return null;

  const number = Number(text);

  if (
    !Number.isInteger(number) ||
    number < 1 ||
    number > TOTAL_PLOTS
  ) {
    return null;
  }

  return number;
}

function isPlotBoundaryPath(element) {
  return (
    element?.tagName?.toLowerCase() === "path" &&
    /[Cc]/.test(element.getAttribute("d") || "")
  );
}

/*
  Maps each ORIGINAL plot boundary to the ORIGINAL plot number.
  No path coordinates, transforms, labels, or plot geometry are changed.

  This mapper has already been verified against the supplied Gudimetla SVG:
  all 272 plot boundaries are detected.
*/
function buildPlotMap(svg) {
  const plotMap = new Map();

  if (!svg) return plotMap;

  const groups = Array.from(svg.querySelectorAll("g"));

  for (const group of groups) {
    const children = Array.from(group.children);

    for (let index = 0; index < children.length; index += 1) {
      const boundary = children[index];

      if (!isPlotBoundaryPath(boundary)) continue;

      let plotNumber = null;
      let plotLabel = null;

      for (
        let nextIndex = index + 1;
        nextIndex < children.length;
        nextIndex += 1
      ) {
        const next = children[nextIndex];

        if (isPlotBoundaryPath(next)) break;
        if (next.tagName?.toLowerCase() !== "text") continue;

        const number = getNumericText(next);

        if (number !== null) {
          plotNumber = number;
          plotLabel = next;
          break;
        }
      }

      if (
        plotNumber === null ||
        !plotLabel ||
        plotMap.has(plotNumber)
      ) {
        continue;
      }

      boundary.dataset.plotNumber = String(plotNumber);
      plotLabel.dataset.plotNumber = String(plotNumber);

      boundary.classList.add("plot-boundary");
      plotLabel.classList.add("plot-number-label");

      /*
        Keeps the interactive boundary stroke visually stable when the
        SVG viewBox zoom changes.
      */
      boundary.setAttribute(
        "vector-effect",
        "non-scaling-stroke"
      );

      plotMap.set(plotNumber, {
        boundary,
        label: plotLabel,
      });
    }
  }

  const missing = [];

  for (let i = 1; i <= TOTAL_PLOTS; i += 1) {
    if (!plotMap.has(i)) {
      missing.push(i);
    }
  }

  console.log(
    `Gudimetla layout: ${plotMap.size}/${TOTAL_PLOTS} plots mapped`
  );

  if (missing.length) {
    console.warn("Missing plot numbers:", missing);
  }

  return plotMap;
}

/*
  Topmost vector-only clarity layer.

  It clones each EXISTING plot boundary and EXISTING number at exactly
  the same SVG coordinates. The clones are stroke/text only and are not
  interactive. This keeps edges and numbers visible above status fills.
*/
function createStatusColorLayer(svg) {
  svg.querySelector(".plot-status-color-layer")?.remove();

  const layer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );

  layer.setAttribute("class", "plot-status-color-layer");
  layer.setAttribute("pointer-events", "none");

  for (let plotNumber = 1; plotNumber <= TOTAL_PLOTS; plotNumber += 1) {
    const points = PLOT_POLYGONS[String(plotNumber)];
    if (!points || points.length < 3) continue;

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );

    polygon.setAttribute(
      "points",
      points.map(([x, y]) => `${x},${y}`).join(" ")
    );
    polygon.dataset.plotNumber = String(plotNumber);
    polygon.classList.add("plot-status-color");
    polygon.setAttribute("fill", "none");
    polygon.setAttribute("fill-opacity", "0");
    polygon.setAttribute("stroke", "none");

    layer.appendChild(polygon);
  }

  const firstDrawable = Array.from(svg.children).find(
    (child) => child.tagName?.toLowerCase() !== "defs"
  );

  if (firstDrawable) svg.insertBefore(layer, firstDrawable);
  else svg.appendChild(layer);

  return layer;
}

function createClarityLayer(svg, plotMap) {
  svg
    .querySelector(".plot-clarity-layer")
    ?.remove();

  const layer = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );

  layer.setAttribute(
    "class",
    "plot-clarity-layer"
  );

  layer.setAttribute(
    "pointer-events",
    "none"
  );

  for (
    let plotNumber = 1;
    plotNumber <= TOTAL_PLOTS;
    plotNumber += 1
  ) {
    const item = plotMap.get(plotNumber);

    if (!item) continue;

    const boundaryClone =
      item.boundary.cloneNode(true);

    boundaryClone.removeAttribute("style");
    boundaryClone.removeAttribute(
      "data-plot-number"
    );

    boundaryClone.setAttribute(
      "fill",
      "none"
    );

    boundaryClone.setAttribute(
      "vector-effect",
      "non-scaling-stroke"
    );

    boundaryClone.setAttribute(
      "pointer-events",
      "none"
    );

    boundaryClone.classList.add(
      "plot-clarity-boundary"
    );

    const labelClone =
      item.label.cloneNode(true);

    labelClone.removeAttribute("style");
    labelClone.removeAttribute(
      "data-plot-number"
    );

    labelClone.setAttribute(
      "pointer-events",
      "none"
    );

    labelClone.classList.add(
      "plot-clarity-label"
    );

    layer.appendChild(boundaryClone);
    layer.appendChild(labelClone);
  }

  svg.appendChild(layer);
}

function svgStatusPolygon(svg, plotNumber) {
  return svg?.querySelector(
    `.plot-status-color[data-plot-number="${Number(plotNumber)}"]`
  ) || null;
}

function paintPlot(
  plotNumber,
  status,
  plotMap,
  selectedPlot
) {
  const item =
    plotMap.get(Number(plotNumber));

  if (!item) return;

  const normalized =
    normalizeStatus(status);

  const meta =
    STATUS_META[normalized];

  const selected =
    Number(selectedPlot) ===
    Number(plotNumber);

  const { boundary, label } = item;

  const statusPolygon = svgStatusPolygon(
    boundary.ownerSVGElement,
    plotNumber
  );

  if (statusPolygon) {
    statusPolygon.classList.remove(
      "plot-available",
      "plot-booked",
      "plot-sold",
      "plot-selected"
    );
    statusPolygon.classList.add(`plot-${normalized}`);
    if (selected) statusPolygon.classList.add("plot-selected");

    statusPolygon.style.setProperty(
      "fill",
      meta.fill || "none",
      "important"
    );
    statusPolygon.style.setProperty(
      "fill-opacity",
      normalized === "available" ? "0" : "0.82",
      "important"
    );
    statusPolygon.style.setProperty(
      "stroke",
      meta.stroke || "none",
      "important"
    );
    statusPolygon.style.setProperty(
      "stroke-width",
      selected ? "4.5" : "2",
      "important"
    );
  }

  boundary.classList.remove(
    "plot-available",
    "plot-booked",
    "plot-sold",
    "plot-selected"
  );

  boundary.classList.add(
    `plot-${normalized}`
  );

  if (selected) {
    boundary.classList.add(
      "plot-selected"
    );
  }

  boundary.dataset.status =
    normalized;

  boundary.setAttribute(
    "aria-label",
    `Plot ${plotNumber}, ${meta.label}`
  );

  // The detected cubic path is the original marker/interaction path, not
  // the plot-area shape. Keep it visually transparent; the real plot-area
  // color is painted by the status polygon layer above.
  boundary.style.setProperty(
    "fill",
    "transparent",
    "important"
  );

  boundary.style.setProperty(
    "fill-opacity",
    "0",
    "important"
  );

  boundary.style.setProperty(
    "stroke",
    "transparent",
    "important"
  );

  boundary.style.setProperty(
    "stroke-opacity",
    "1",
    "important"
  );

  boundary.style.setProperty(
    "stroke-width",
    selected ? "4.5" : "2",
    "important"
  );

  boundary.style.setProperty(
    "cursor",
    "pointer",
    "important"
  );

  boundary.style.setProperty(
    "pointer-events",
    "all",
    "important"
  );

  if (label) {
    label.classList.toggle(
      "plot-number-selected",
      selected
    );

    label.style.setProperty(
      "fill",
      "#111827",
      "important"
    );

    label.style.setProperty(
      "stroke",
      "#ffffff",
      "important"
    );

    label.style.setProperty(
      "stroke-width",
      "1.5",
      "important"
    );

    label.style.setProperty(
      "paint-order",
      "stroke fill",
      "important"
    );

    label.style.setProperty(
      "font-weight",
      "800",
      "important"
    );

    label.style.setProperty(
      "cursor",
      "pointer",
      "important"
    );

    label.style.setProperty(
      "pointer-events",
      "all",
      "important"
    );
  }
}

function paintAllPlots(
  statuses,
  plotMap,
  selectedPlot
) {
  if (!plotMap?.size) return;

  for (
    let plotNumber = 1;
    plotNumber <= TOTAL_PLOTS;
    plotNumber += 1
  ) {
    paintPlot(
      plotNumber,
      statuses[plotNumber] ??
        "available",
      plotMap,
      selectedPlot
    );
  }
}

function fullViewBox() {
  return {
    x: 0,
    y: 0,
    width: SVG_WIDTH,
    height: SVG_HEIGHT,
  };
}

function clampViewBox(viewBox) {
  const width = clamp(
    viewBox.width,
    SVG_WIDTH / MAX_ZOOM,
    SVG_WIDTH
  );

  const height =
    width *
    (SVG_HEIGHT / SVG_WIDTH);

  const maxX =
    SVG_WIDTH - width;

  const maxY =
    SVG_HEIGHT - height;

  return {
    x: clamp(viewBox.x, 0, Math.max(0, maxX)),
    y: clamp(viewBox.y, 0, Math.max(0, maxY)),
    width,
    height,
  };
}

function GudimetlaLayoutMap() {
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const plotMapRef = useRef(new Map());

  const activePointersRef =
    useRef(new Map());

  const gestureRef = useRef(null);

  const viewBoxRef =
    useRef(fullViewBox());

  const [svgLoaded, setSvgLoaded] =
    useState(false);

  const [svgError, setSvgError] =
    useState("");

  const [dimensions, setDimensions] =
    useState(
      createDefaultDimensions
    );

  const [statuses, setStatuses] =
    useState(
      createInitialStatuses
    );

  const [selectedPlot, setSelectedPlot] =
    useState(null);

  const [viewBox, setViewBox] =
    useState(fullViewBox);

  const [isDragging, setIsDragging] =
    useState(false);

  const zoom =
    SVG_WIDTH / viewBox.width;

  const applyViewBox =
    useCallback((next) => {
      const safe =
        clampViewBox(next);

      viewBoxRef.current = safe;
      setViewBox(safe);
    }, []);

  /*
    IMPORTANT CLARITY FIX:
    Zoom is applied by changing the SVG viewBox, not by CSS transform: scale().
    The browser therefore re-renders the SVG paths/text as vectors.
  */
  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) return;

    svg.setAttribute(
      "viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    );
  }, [viewBox]);

  const screenToSvg =
    useCallback((clientX, clientY) => {
      const svg = svgRef.current;

      if (!svg) return null;

      const matrix =
        svg.getScreenCTM();

      if (!matrix) return null;

      const point =
        new DOMPoint(
          clientX,
          clientY
        ).matrixTransform(
          matrix.inverse()
        );

      return {
        x: point.x,
        y: point.y,
      };
    }, []);

  const getRenderedSvgMetrics =
    useCallback((targetViewBox) => {
      const svg = svgRef.current;

      if (!svg) return null;

      const rect =
        svg.getBoundingClientRect();

      const scale = Math.min(
        rect.width /
          targetViewBox.width,
        rect.height /
          targetViewBox.height
      );

      const renderedWidth =
        targetViewBox.width *
        scale;

      const renderedHeight =
        targetViewBox.height *
        scale;

      return {
        rect,
        scale,
        offsetX:
          (rect.width -
            renderedWidth) /
          2,
        offsetY:
          (rect.height -
            renderedHeight) /
          2,
      };
    }, []);

  const zoomToAtScreenPoint =
    useCallback(
      (
        nextZoomValue,
        clientX,
        clientY
      ) => {
        const current =
          viewBoxRef.current;

        const anchor =
          screenToSvg(
            clientX,
            clientY
          );

        const svg =
          svgRef.current;

        if (!anchor || !svg) return;

        const nextZoom = clamp(
          nextZoomValue,
          MIN_ZOOM,
          MAX_ZOOM
        );

        const nextWidth =
          SVG_WIDTH / nextZoom;

        const nextHeight =
          SVG_HEIGHT / nextZoom;

        const nextViewBox = {
          x: 0,
          y: 0,
          width: nextWidth,
          height: nextHeight,
        };

        const metrics =
          getRenderedSvgMetrics(
            nextViewBox
          );

        if (!metrics) return;

        const localX =
          clientX -
          metrics.rect.left -
          metrics.offsetX;

        const localY =
          clientY -
          metrics.rect.top -
          metrics.offsetY;

        /*
          Keep the same SVG coordinate underneath the cursor/touch point.
        */
        nextViewBox.x =
          anchor.x -
          localX / metrics.scale;

        nextViewBox.y =
          anchor.y -
          localY / metrics.scale;

        applyViewBox(nextViewBox);
      },
      [
        applyViewBox,
        getRenderedSvgMetrics,
        screenToSvg,
      ]
    );

  const zoomAtCenter =
    useCallback(
      (nextZoom) => {
        const svg =
          svgRef.current;

        if (!svg) return;

        const rect =
          svg.getBoundingClientRect();

        zoomToAtScreenPoint(
          nextZoom,
          rect.left +
            rect.width / 2,
          rect.top +
            rect.height / 2
        );
      },
      [zoomToAtScreenPoint]
    );

  const fitMap =
    useCallback(() => {
      applyViewBox(
        fullViewBox()
      );
    }, [applyViewBox]);

  const resetMap =
    useCallback(() => {
      setSelectedPlot(null);
      applyViewBox(
        fullViewBox()
      );
    }, [applyViewBox]);

  const loadPlotStatuses =
    useCallback(async () => {
      try {
        /*
          STATUS FIX:
          A plot becomes Sold/red when the linked customer is fully paid
          or registration is completed, even if plots.status is still stale.
        */
        const [
          plotsResult,
          customersResult,
          paymentsResult,
        ] = await Promise.all([
          supabase
            .from("plots")
            .select(
              "plot_no, status, customer_id"
            ),

          supabase
            .from("customers")
            .select(
              "id, status, registration_status, total_amount, amount_paid"
            ),

          supabase
            .from("payments")
            .select(
              "customer_id, amount"
            ),
        ]);

        if (plotsResult.error) {
          throw plotsResult.error;
        }

        if (customersResult.error) {
          throw customersResult.error;
        }

        if (paymentsResult.error) {
          throw paymentsResult.error;
        }

        const next =
          createInitialStatuses();

        const customersById =
          new Map();

        for (
          const customer of
            customersResult.data || []
        ) {
          customersById.set(
            Number(customer.id),
            customer
          );
        }

        const paidByCustomer =
          new Map();

        for (
          const payment of
            paymentsResult.data || []
        ) {
          const customerId =
            Number(
              payment.customer_id
            );

          if (
            !Number.isFinite(
              customerId
            )
          ) {
            continue;
          }

          const amount =
            Number(payment.amount) || 0;

          paidByCustomer.set(
            customerId,
            (paidByCustomer.get(
              customerId
            ) || 0) + amount
          );
        }

        for (
          const row of
            plotsResult.data || []
        ) {
          const plotNumber =
            Number(row.plot_no);

          if (
            !Number.isInteger(
              plotNumber
            ) ||
            plotNumber < 1 ||
            plotNumber >
              TOTAL_PLOTS
          ) {
            continue;
          }

          let resolvedStatus =
            normalizeStatus(
              row.status
            );

          const customerId =
            Number(
              row.customer_id
            );

          const customer =
            Number.isFinite(
              customerId
            )
              ? customersById.get(
                  customerId
                )
              : null;

          if (customer) {
            const registrationStatus =
              String(
                customer.registration_status ??
                  ""
              )
                .trim()
                .toLowerCase();

            const customerStatus =
              normalizeStatus(
                customer.status
              );

            const totalAmount =
              Number(
                customer.total_amount
              ) || 0;

            const storedPaid =
              Number(
                customer.amount_paid
              ) || 0;

            const paymentSum =
              paidByCustomer.get(
                customerId
              ) || 0;

            const effectivePaid =
              Math.max(
                storedPaid,
                paymentSum
              );

            const fullyPaid =
              totalAmount > 0 &&
              effectivePaid >=
                totalAmount;

            const registrationCompleted =
              registrationStatus ===
                "completed" ||
              registrationStatus ===
                "registered";

            if (
              fullyPaid ||
              registrationCompleted ||
              customerStatus ===
                "sold"
            ) {
              resolvedStatus =
                "sold";
            } else if (
              customerId &&
              resolvedStatus ===
                "available"
            ) {
              resolvedStatus =
                "booked";
            }
          }

          next[
            plotNumber
          ] = resolvedStatus;
        }

        setStatuses(next);
      } catch (error) {
        console.error(
          "Error loading plot statuses:",
          error
        );
      }
    }, []);

  useEffect(() => {
    loadPlotStatuses();
  }, [loadPlotStatuses]);

  useEffect(() => {
    /*
      Refresh the map when plot/customer/payment data changes.
      The five-second fallback remains in place.
    */
    const channel =
      supabase
        .channel(
          "gudimetla-layout-live-status"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "plots",
          },
          () => {
            loadPlotStatuses();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "customers",
          },
          () => {
            loadPlotStatuses();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "payments",
          },
          () => {
            loadPlotStatuses();
          }
        )
        .subscribe();

    const fallback =
      window.setInterval(
        loadPlotStatuses,
        5000
      );

    return () => {
      window.clearInterval(
        fallback
      );

      supabase.removeChannel(
        channel
      );
    };
  }, [loadPlotStatuses]);

  useEffect(() => {
    let cancelled = false;

    async function loadDimensions() {
      try {
        const response =
          await fetch(
            DIMENSIONS_URL,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          return;
        }

        const text =
          await response.text();

        if (cancelled) {
          return;
        }

        setDimensions(
          (previous) => ({
            ...previous,
            ...parseDimensionsText(
              text
            ),
          })
        );
      } catch (error) {
        console.warn(
          "Dimension loading failed:",
          error
        );
      }
    }

    loadDimensions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSvg() {
      try {
        setSvgLoaded(false);
        setSvgError("");

        const response =
          await fetch(
            SVG_URL,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            `Could not load ${SVG_URL}. HTTP ${response.status}`
          );
        }

        const svgText =
          await response.text();

        if (cancelled) return;

        const parser =
          new DOMParser();

        const document =
          parser.parseFromString(
            svgText,
            "image/svg+xml"
          );

        if (
          document.querySelector(
            "parsererror"
          )
        ) {
          throw new Error(
            "layout.svg is invalid."
          );
        }

        const svg =
          document.documentElement;

        if (
          !svg ||
          svg.tagName.toLowerCase() !==
            "svg"
        ) {
          throw new Error(
            "Loaded file is not an SVG."
          );
        }

        svg.removeAttribute(
          "width"
        );

        svg.removeAttribute(
          "height"
        );

        svg.setAttribute(
          "viewBox",
          `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`
        );

        svg.setAttribute(
          "preserveAspectRatio",
          "xMidYMid meet"
        );

        svg.classList.add(
          "layout-svg"
        );

        const canvas =
          canvasRef.current;

        if (!canvas) return;

        canvas.replaceChildren(
          svg
        );

        svgRef.current = svg;

        const plotMap =
          buildPlotMap(svg);

        plotMapRef.current =
          plotMap;

        createStatusColorLayer(svg);

        createClarityLayer(
          svg,
          plotMap
        );

        if (
          plotMap.size !==
          TOTAL_PLOTS
        ) {
          console.warn(
            `Expected ${TOTAL_PLOTS} plots, mapped ${plotMap.size}.`
          );
        }

        paintAllPlots(
          statuses,
          plotMap,
          selectedPlot
        );

        viewBoxRef.current =
          fullViewBox();

        setViewBox(
          fullViewBox()
        );

        if (!cancelled) {
          setSvgLoaded(true);
        }
      } catch (error) {
        console.error(
          "SVG loading error:",
          error
        );

        if (!cancelled) {
          setSvgError(
            error?.message ||
              "Could not load layout.svg"
          );
        }
      }
    }

    loadSvg();

    return () => {
      cancelled = true;
    };
    // Parse the SVG once; later status changes repaint the existing SVG.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!svgLoaded) {
      return;
    }

    paintAllPlots(
      statuses,
      plotMapRef.current,
      selectedPlot
    );
  }, [
    statuses,
    selectedPlot,
    svgLoaded,
  ]);

  useEffect(() => {
    const svg =
      svgRef.current;

    if (
      !svg ||
      !svgLoaded
    ) {
      return undefined;
    }

    const handleSvgClick =
      (event) => {
        const target =
          event.target?.closest?.(
            "[data-plot-number]"
          );

        if (!target) return;

        const plotNumber =
          Number(
            target.dataset
              .plotNumber
          );

        if (
          !Number.isInteger(
            plotNumber
          ) ||
          plotNumber < 1 ||
          plotNumber >
            TOTAL_PLOTS
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        setSelectedPlot(
          plotNumber
        );
      };

    svg.addEventListener(
      "click",
      handleSvgClick
    );

    return () => {
      svg.removeEventListener(
        "click",
        handleSvgClick
      );
    };
  }, [svgLoaded]);

  /*
    Wheel / trackpad zoom.
    No CSS scale is used.
  */
  useEffect(() => {
    const viewport =
      viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const handleWheel =
      (event) => {
        event.preventDefault();

        const currentZoom =
          SVG_WIDTH /
          viewBoxRef.current.width;

        const modeScale =
          event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
            ? viewport.clientHeight
            : 1;

        const delta =
          event.deltaY *
          modeScale;

        const factor =
          Math.exp(
            -delta * 0.0015
          );

        zoomToAtScreenPoint(
          currentZoom * factor,
          event.clientX,
          event.clientY
        );
      };

    viewport.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    return () => {
      viewport.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, [zoomToAtScreenPoint]);

  const startPanGesture =
    useCallback(
      (pointer) => {
        const svg =
          svgRef.current;

        if (!svg) return;

        const startViewBox = {
          ...viewBoxRef.current,
        };

        const metrics =
          getRenderedSvgMetrics(
            startViewBox
          );

        if (!metrics) return;

        gestureRef.current = {
          type: "pan",
          pointerId:
            pointer.pointerId,
          startClientX:
            pointer.clientX,
          startClientY:
            pointer.clientY,
          startViewBox,
          scale:
            metrics.scale,
        };

        setIsDragging(true);
      },
      [getRenderedSvgMetrics]
    );

  const startPinchGesture =
    useCallback(() => {
      const pointers =
        Array.from(
          activePointersRef
            .current
            .values()
        );

      if (
        pointers.length < 2
      ) {
        return;
      }

      const first =
        pointers[0];

      const second =
        pointers[1];

      const midpointX =
        (first.clientX +
          second.clientX) /
        2;

      const midpointY =
        (first.clientY +
          second.clientY) /
        2;

      const anchor =
        screenToSvg(
          midpointX,
          midpointY
        );

      if (!anchor) return;

      const distance =
        Math.max(
          1,
          Math.hypot(
            second.clientX -
              first.clientX,
            second.clientY -
              first.clientY
          )
        );

      const startViewBox = {
        ...viewBoxRef.current,
      };

      gestureRef.current = {
        type: "pinch",
        startDistance:
          distance,
        startZoom:
          SVG_WIDTH /
          startViewBox.width,
        anchor,
      };

      setIsDragging(false);
    }, [screenToSvg]);

  const handlePointerDown =
    (event) => {
      if (
        event.target?.closest?.(
          ".plot-details"
        ) ||
        event.target?.closest?.(
          ".zoom-controls"
        )
      ) {
        return;
      }

      activePointersRef.current.set(
        event.pointerId,
        {
          pointerId:
            event.pointerId,
          clientX:
            event.clientX,
          clientY:
            event.clientY,
        }
      );

      try {
        event.currentTarget.setPointerCapture(
          event.pointerId
        );
      } catch {
        // Pointer capture can be unavailable on some browsers.
      }

      if (
        activePointersRef.current
          .size >= 2
      ) {
        startPinchGesture();
        return;
      }

      if (
        !event.target?.closest?.(
          "[data-plot-number]"
        )
      ) {
        startPanGesture({
          pointerId:
            event.pointerId,
          clientX:
            event.clientX,
          clientY:
            event.clientY,
        });
      }
    };

  const handlePointerMove =
    (event) => {
      if (
        !activePointersRef.current.has(
          event.pointerId
        )
      ) {
        return;
      }

      activePointersRef.current.set(
        event.pointerId,
        {
          pointerId:
            event.pointerId,
          clientX:
            event.clientX,
          clientY:
            event.clientY,
        }
      );

      const gesture =
        gestureRef.current;

      if (!gesture) return;

      if (
        gesture.type === "pan"
      ) {
        if (
          gesture.pointerId !==
          event.pointerId
        ) {
          return;
        }

        const dx =
          event.clientX -
          gesture.startClientX;

        const dy =
          event.clientY -
          gesture.startClientY;

        applyViewBox({
          ...gesture.startViewBox,
          x:
            gesture.startViewBox.x -
            dx / gesture.scale,
          y:
            gesture.startViewBox.y -
            dy / gesture.scale,
        });

        return;
      }

      if (
        gesture.type === "pinch"
      ) {
        const pointers =
          Array.from(
            activePointersRef
              .current
              .values()
          );

        if (
          pointers.length < 2
        ) {
          return;
        }

        const first =
          pointers[0];

        const second =
          pointers[1];

        const midpointX =
          (first.clientX +
            second.clientX) /
          2;

        const midpointY =
          (first.clientY +
            second.clientY) /
          2;

        const distance =
          Math.max(
            1,
            Math.hypot(
              second.clientX -
                first.clientX,
              second.clientY -
                first.clientY
            )
          );

        const nextZoom =
          clamp(
            gesture.startZoom *
              (distance /
                gesture.startDistance),
            MIN_ZOOM,
            MAX_ZOOM
          );

        const nextWidth =
          SVG_WIDTH /
          nextZoom;

        const nextHeight =
          SVG_HEIGHT /
          nextZoom;

        const nextViewBox = {
          x: 0,
          y: 0,
          width: nextWidth,
          height: nextHeight,
        };

        const metrics =
          getRenderedSvgMetrics(
            nextViewBox
          );

        if (!metrics) {
          return;
        }

        const localX =
          midpointX -
          metrics.rect.left -
          metrics.offsetX;

        const localY =
          midpointY -
          metrics.rect.top -
          metrics.offsetY;

        nextViewBox.x =
          gesture.anchor.x -
          localX /
            metrics.scale;

        nextViewBox.y =
          gesture.anchor.y -
          localY /
            metrics.scale;

        applyViewBox(
          nextViewBox
        );
      }
    };

  const handlePointerEnd =
    (event) => {
      activePointersRef.current.delete(
        event.pointerId
      );

      try {
        if (
          event.currentTarget.hasPointerCapture(
            event.pointerId
          )
        ) {
          event.currentTarget.releasePointerCapture(
            event.pointerId
          );
        }
      } catch {
        // Ignore unsupported pointer-capture state.
      }

      const remaining =
        Array.from(
          activePointersRef
            .current
            .values()
        );

      if (
        remaining.length >= 2
      ) {
        startPinchGesture();
        return;
      }

      if (
        remaining.length === 1
      ) {
        startPanGesture(
          remaining[0]
        );

        return;
      }

      gestureRef.current =
        null;

      setIsDragging(false);
    };

  const changeSelectedStatus =
    async (nextStatus) => {
      if (!selectedPlot) {
        return;
      }

      const plotNumber =
        selectedPlot;

      const normalized =
        normalizeStatus(
          nextStatus
        );

      const previousStatus =
        statuses[plotNumber] ??
        "available";

      /*
        Immediate UI repaint.
      */
      setStatuses(
        (current) => ({
          ...current,
          [plotNumber]:
            normalized,
        })
      );

      paintPlot(
        plotNumber,
        normalized,
        plotMapRef.current,
        selectedPlot
      );

      const { error } =
        await supabase
          .from("plots")
          .update({
            status:
              databaseStatus(
                normalized
              ),
          })
          .eq(
            "plot_no",
            plotNumber
          );

      if (error) {
        console.error(
          "Plot status update failed:",
          error
        );

        setStatuses(
          (current) => ({
            ...current,
            [plotNumber]:
              previousStatus,
          })
        );

        paintPlot(
          plotNumber,
          previousStatus,
          plotMapRef.current,
          selectedPlot
        );

        return;
      }

      loadPlotStatuses();
    };

  const bookedCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          (status) =>
            status === "booked"
        ).length,
      [statuses]
    );

  const soldCount =
    useMemo(
      () =>
        Object.values(
          statuses
        ).filter(
          (status) =>
            status === "sold"
        ).length,
      [statuses]
    );

  const availableCount =
    TOTAL_PLOTS -
    bookedCount -
    soldCount;

  const selectedPlotData =
    useMemo(() => {
      if (!selectedPlot) {
        return null;
      }

      return {
        plotNumber:
          selectedPlot,

        status:
          normalizeStatus(
            statuses[
              selectedPlot
            ]
          ),

        length:
          dimensions[
            selectedPlot
          ]?.length ??
          null,

        breadth:
          dimensions[
            selectedPlot
          ]?.breadth ??
          null,
      };
    }, [
      selectedPlot,
      statuses,
      dimensions,
    ]);

  return (
    <div className="layout-page">
      <header className="layout-header">
        <div className="header-title">
          <h1>
            Gudimetla Layout
          </h1>

          <p>
            Select a plot to view
            its status and dimensions.
          </p>
        </div>

        <div className="summary-cards">
          <div className="summary-card total">
            <strong>
              {TOTAL_PLOTS}
            </strong>
            <span>Total</span>
          </div>

          <div className="summary-card available">
            <strong>
              {availableCount}
            </strong>
            <span>Available</span>
          </div>

          <div className="summary-card booked">
            <strong>
              {bookedCount}
            </strong>
            <span>Booked</span>
          </div>

          <div className="summary-card sold">
            <strong>
              {soldCount}
            </strong>
            <span>Sold</span>
          </div>
        </div>
      </header>

      <div className="layout-toolbar">
        <div
          className="legend"
          aria-label="Plot status legend"
        >
          <div className="legend-item">
            <span className="legend-dot available-dot" />
            <span>Available</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot booked-dot" />
            <span>Booked</span>
          </div>

          <div className="legend-item">
            <span className="legend-dot sold-dot" />
            <span>Sold</span>
          </div>
        </div>

        <div
          className="zoom-controls"
          onPointerDown={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            onClick={() =>
              zoomAtCenter(
                zoom /
                  BUTTON_ZOOM_FACTOR
              )
            }
            disabled={
              zoom <= MIN_ZOOM +
                0.001
            }
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>

          <span>
            {Math.round(
              zoom * 100
            )}
            %
          </span>

          <button
            type="button"
            onClick={() =>
              zoomAtCenter(
                zoom *
                  BUTTON_ZOOM_FACTOR
              )
            }
            disabled={
              zoom >= MAX_ZOOM -
                0.001
            }
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>

          <button
            type="button"
            onClick={fitMap}
            aria-label="Fit map"
            title="Fit entire map"
          >
            Fit
          </button>

          <button
            type="button"
            onClick={resetMap}
            aria-label="Reset map"
            title="Reset map"
          >
            Reset
          </button>
        </div>
      </div>

      <main
        ref={viewportRef}
        className={`map-viewport ${
          isDragging
            ? "is-dragging"
            : ""
        }`}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerEnd
        }
        onPointerCancel={
          handlePointerEnd
        }
      >
        <div className="map-background" />

        {/*
          IMPORTANT:
          There is NO CSS transform: scale() around the SVG.
          The SVG occupies this viewport directly and zoom/pan are handled
          by the SVG viewBox for true vector re-rendering.
        */}
        <div
          ref={canvasRef}
          className="map-canvas"
        />

        {!svgLoaded &&
          !svgError && (
            <div className="map-loading">
              <div className="loading-spinner" />
              <p>
                Loading layout map...
              </p>
            </div>
          )}

        {svgError && (
          <div className="map-error">
            <h2>
              Layout map not found
            </h2>

            <p>
              {svgError}
            </p>

            <code>
              public/layout.svg
            </code>
          </div>
        )}

        {selectedPlotData && (
          <aside
            className="plot-details"
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="plot-details-header">
              <div>
                <small>PLOT</small>

                <h2>
                  {
                    selectedPlotData.plotNumber
                  }
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setSelectedPlot(
                    null
                  )
                }
                aria-label="Close plot details"
              >
                ×
              </button>
            </div>

            <div
              className={`status-badge status-${selectedPlotData.status}`}
            >
              {
                STATUS_META[
                  selectedPlotData.status
                ].label
              }
            </div>

            <div className="dimension-grid">
              <div>
                <span>
                  Length
                </span>

                <strong>
                  {selectedPlotData.length !==
                  null
                    ? `${selectedPlotData.length} ft`
                    : "Not available"}
                </strong>
              </div>

              <div>
                <span>
                  Breadth
                </span>

                <strong>
                  {selectedPlotData.breadth !==
                  null
                    ? `${selectedPlotData.breadth} ft`
                    : "Not available"}
                </strong>
              </div>
            </div>

            <div className="status-actions">
              <button
                type="button"
                className="available-button"
                disabled={
                  selectedPlotData.status ===
                  "available"
                }
                onClick={() =>
                  changeSelectedStatus(
                    "available"
                  )
                }
              >
                Available
              </button>

              <button
                type="button"
                className="booked-button"
                disabled={
                  selectedPlotData.status ===
                  "booked"
                }
                onClick={() =>
                  changeSelectedStatus(
                    "booked"
                  )
                }
              >
                Booked
              </button>

              <button
                type="button"
                className="sold-button"
                disabled={
                  selectedPlotData.status ===
                  "sold"
                }
                onClick={() =>
                  changeSelectedStatus(
                    "sold"
                  )
                }
              >
                Sold
              </button>
            </div>
          </aside>
        )}

        <div className="map-help">
          <span>
            {TOTAL_PLOTS} plots
          </span>

          <span>•</span>
          <span>Drag to pan</span>
          <span>•</span>
          <span>
            Wheel/pinch to zoom
          </span>
        </div>
      </main>
    </div>
  );
}


/* =========================================================
   THOTLARAVULAPADU — ADDITION ONLY
   The Gudimetla component above is preserved.
   ========================================================= */
const THOT_SVG_URL = "/thotlaravulapadu-layout.svg";
const THOT_WIDTH = 1588;
const THOT_HEIGHT = 1122.6667;
const THOT_TOTAL_PLOTS = 76;

// These coordinates are the actual plot-number positions from the supplied
// Thotlaravulapadu SVG. The image and overlays share this exact SVG viewBox.
const THOT_PLOT_CENTERS = {"1":[316.27,281.23],"2":[316.59,333.07],"3":[316.59,371.47],"4":[316.59,410.03],"5":[316.59,448.59],"6":[316.59,486.99],"7":[316.59,525.55],"8":[316.11,580.75],"9":[320.27,718.19],"10":[314.67,783.15],"11":[313.71,838.35],"12":[313.87,885.71],"13":[445.71,890.83],"14":[445.71,838.83],"15":[445.71,790.83],"16":[445.71,719.31],"17":[444.43,575.95],"18":[446.99,522.35],"19":[447.79,479.47],"20":[447.63,440.91],"21":[447.31,402.51],"22":[447.15,363.95],"23":[447.31,325.39],"24":[528.75,358.51],"25":[529.23,402.51],"26":[529.23,440.91],"27":[529.23,479.47],"28":[528.27,522.35],"29":[531.15,575.95],"30":[529.55,719.31],"31":[529.55,790.83],"32":[529.55,838.83],"33":[530.03,890.83],"34":[662.99,890.83],"35":[662.35,838.83],"36":[662.35,790.83],"37":[662.35,719.31],"38":[663.95,575.95],"39":[662.03,520.59],"40":[662.03,479.47],"41":[662.03,440.91],"42":[661.71,392.91],"43":[748.75,402.51],"44":[748.75,440.91],"45":[748.75,479.47],"46":[748.75,522.03],"47":[750.67,575.95],"48":[749.07,719.31],"49":[749.07,790.83],"50":[749.07,838.83],"51":[749.55,890.83],"52":[883.31,900.59],"53":[881.87,838.83],"54":[883.79,784.91],"55":[883.47,721.71],"56":[883.47,575.95],"57":[881.55,520.75],"58":[881.55,475.63],"59":[881.55,437.07],"60":[967.79,470.51],"61":[968.59,515.31],"62":[970.19,575.95],"63":[967.63,721.71],"64":[969.71,783.79],"65":[968.59,839.95],"66":[970.83,901.87],"67":[1110.35,894.83],"68":[1107.47,839.95],"69":[1104.91,783.31],"70":[1104.91,718.19],"71":[1101.23,582.35],"72":[1101.07,510.83],"73":[1190.67,561.07],"74":[1187.47,739.15],"75":[1187.47,827.47],"76":[1190.35,908.11]};
const THOT_PLOT_DIMENSIONS = {"1":{"length":45.0,"breadth":22.6},"2":{"length":45.0,"breadth":20.0},"3":{"length":45.0,"breadth":20.0},"4":{"length":45.0,"breadth":20.0},"5":{"length":45.0,"breadth":20.0},"6":{"length":45.0,"breadth":20.0},"7":{"length":45.0,"breadth":20.0},"8":{"length":45.0,"breadth":40.0},"9":{"length":45.0,"breadth":40.0},"10":{"length":45.0,"breadth":30.0},"11":{"length":45.0,"breadth":25.0},"12":{"length":45.0,"breadth":25.0},"13":{"length":45.0,"breadth":28.0},"14":{"length":45.0,"breadth":25.0},"15":{"length":45.0,"breadth":30.0},"16":{"length":45.0,"breadth":40.0},"17":{"length":45.0,"breadth":40.0},"18":{"length":45.0,"breadth":25.0},"19":{"length":45.0,"breadth":20.0},"20":{"length":45.0,"breadth":20.0},"21":{"length":45.0,"breadth":20.0},"22":{"length":45.0,"breadth":20.0},"23":{"length":45.0,"breadth":20.0},"24":{"length":45.0,"breadth":30.0},"25":{"length":45.0,"breadth":20.0},"26":{"length":45.0,"breadth":20.0},"27":{"length":45.0,"breadth":20.0},"28":{"length":45.0,"breadth":20.0},"29":{"length":45.0,"breadth":40.0},"30":{"length":45.0,"breadth":40.0},"31":{"length":45.0,"breadth":30.0},"32":{"length":45.0,"breadth":25.0},"33":{"length":45.0,"breadth":30.0},"34":{"length":45.0,"breadth":34.1},"35":{"length":45.0,"breadth":25.0},"36":{"length":45.0,"breadth":30.0},"37":{"length":45.0,"breadth":40.0},"38":{"length":45.0,"breadth":40.0},"39":{"length":45.0,"breadth":25.0},"40":{"length":45.0,"breadth":20.0},"41":{"length":45.0,"breadth":20.0},"42":{"length":45.0,"breadth":32.0},"43":{"length":45.0,"breadth":20.0},"44":{"length":45.0,"breadth":20.0},"45":{"length":45.0,"breadth":20.0},"46":{"length":45.0,"breadth":25.0},"47":{"length":45.0,"breadth":40.0},"48":{"length":45.0,"breadth":40.0},"49":{"length":45.0,"breadth":30.0},"50":{"length":45.0,"breadth":25.0},"51":{"length":45.0,"breadth":36.2},"52":{"length":45.0,"breadth":38.0},"53":{"length":45.0,"breadth":25.0},"54":{"length":45.0,"breadth":30.0},"55":{"length":45.0,"breadth":40.0},"56":{"length":45.0,"breadth":40.0},"57":{"length":45.0,"breadth":27.0},"58":{"length":45.0,"breadth":20.0},"59":{"length":45.0,"breadth":20.0},"60":{"length":45.0,"breadth":25.0},"61":{"length":45.0,"breadth":30.0},"62":{"length":45.0,"breadth":40.0},"63":{"length":45.0,"breadth":40.0},"64":{"length":45.0,"breadth":30.0},"65":{"length":45.0,"breadth":25.0},"66":{"length":45.0,"breadth":39.0},"67":{"length":45.0,"breadth":40.1},"68":{"length":45.0,"breadth":25.0},"69":{"length":45.0,"breadth":30.0},"70":{"length":45.0,"breadth":40.0},"71":{"length":45.0,"breadth":40.0},"72":{"length":45.0,"breadth":36.8},"73":{"length":45.0,"breadth":65.0},"74":{"length":45.0,"breadth":57.0},"75":{"length":45.0,"breadth":40.0},"76":{"length":45.0,"breadth":40.0}};
const THOT_FT_TO_SVG = 1.92;


const THOT_PLOT_POLYGONS = {"1":[[279.55,254.89],[362,275.5],[362,316],[279.55,316]],"2":[[279.18,316],[362,316],[362,355],[279.18,355]],"3":[[279.04,355],[362,355],[362,393],[279.04,393]],"4":[[278.9,393],[362,393],[362,432],[278.9,432]],"5":[[278.77,432],[362,432],[362,470],[278.77,470]],"6":[[278.63,470],[362,470],[362,509],[278.63,509]],"7":[[278.5,509],[362,509],[362,547],[278.5,547]],"8":[[278.22,547],[362,547],[362,624],[278.22,624]],"9":[[278.02,682],[362,682],[362,759],[278.02,759]],"10":[[277.75,759],[362,759],[362,817],[277.75,817]],"11":[[277.54,817],[362,817],[362,865],[277.54,865]],"12":[[277.37,865],[362,865],[362,920.1],[277.37,917.15]],"23":[[408,287.0],[495,308.75],[495,307],[408,307]],"22":[[408,307],[495,307],[495,345],[408,345]],"21":[[408,345],[495,345],[495,384],[408,384]],"20":[[408,384],[495,384],[495,422],[408,422]],"19":[[408,422],[495,422],[495,461],[408,461]],"18":[[408,461],[495,461],[495,499],[408,499]],"17":[[408,499],[495,499],[495,547],[408,547]],"16":[[408,682],[495,682],[495,759],[408,759]],"15":[[408,759],[495,759],[495,817],[408,817]],"14":[[408,817],[495,817],[495,865],[408,865]],"13":[[408,865],[495,865],[495,924.73],[408,921.7]],"24":[[495,308.75],[581,330.25],[581,384],[495,384]],"25":[[495,384],[581,384],[581,422],[495,422]],"26":[[495,422],[581,422],[581,461],[495,461]],"27":[[495,461],[581,461],[581,499],[495,499]],"28":[[495,499],[581,499],[581,547],[495,547]],"29":[[495,547],[581,547],[581,624],[495,624]],"30":[[495,682],[581,682],[581,759],[495,759]],"31":[[495,759],[581,759],[581,817],[495,817]],"32":[[495,817],[581,817],[581,865],[495,865]],"33":[[495,865],[581,865],[581,927.72],[495,924.73]],"42":[[627,341.75],[714,363.5],[714,422],[627,422]],"41":[[627,422],[714,422],[714,461],[627,461]],"40":[[627,461],[714,461],[714,499],[627,499]],"39":[[627,499],[714,499],[714,547],[627,547]],"38":[[627,547],[714,547],[714,624],[627,624]],"37":[[627,682],[714,682],[714,759],[627,759]],"36":[[627,759],[714,759],[714,817],[627,817]],"35":[[627,817],[714,817],[714,865],[627,865]],"34":[[627,865],[714,865],[714,932.35],[627,929.32]],"43":[[714,363.5],[801,385.25],[801,422],[714,422]],"44":[[714,422],[801,422],[801,461],[714,461]],"45":[[714,461],[801,461],[801,499],[714,499]],"46":[[714,499],[801,499],[801,547],[714,547]],"47":[[714,547],[801,547],[801,624],[714,624]],"48":[[714,682],[801,682],[801,759],[714,759]],"49":[[714,759],[801,759],[801,817],[714,817]],"50":[[714,817],[801,817],[801,865],[714,865]],"51":[[714,865],[801,865],[801,935.37],[714,932.35]],"59":[[847,396.75],[934,418.5],[934,457],[847,457]],"58":[[847,457],[934,457],[934,495],[847,495]],"57":[[847,495],[934,495],[934,547],[847,547]],"56":[[847,547],[934,547],[934,624],[847,624]],"55":[[847,682],[934,682],[934,759],[847,759]],"54":[[847,759],[934,759],[934,817],[847,817]],"53":[[847,817],[934,817],[934,865],[847,865]],"52":[[847,865],[934,865],[934,940.0],[847,936.98]],"60":[[934,418.5],[1020,440.0],[1020,490],[934,490]],"61":[[934,490],[1020,490],[1020,547],[934,547]],"62":[[934,547],[1020,547],[1020,624],[934,624]],"63":[[934,682],[1020,682],[1020,759],[934,759]],"64":[[934,759],[1020,759],[1020,817],[934,817]],"65":[[934,817],[1020,817],[1020,865],[934,865]],"66":[[934,865],[1020,865],[1020,943.0],[934,940.0]],"72":[[1020,440.0],[1153,473.25],[1153,547],[1020,547]],"71":[[1020,547],[1153,547],[1153,624],[1020,624]],"70":[[1020,682],[1153,682],[1153,759],[1020,759]],"69":[[1020,759],[1153,759],[1153,817],[1020,817]],"68":[[1020,817],[1153,817],[1153,865],[1020,865]],"67":[[1020,865],[1153,865],[1153,947.62],[1020,943.0]],"73":[[1153,473.25],[1242.5,495.62],[1242.5,624],[1153,624]],"74":[[1153,682],[1242.5,682],[1242.5,791],[1153,791]],"75":[[1153,791],[1242.5,791],[1242.5,868],[1153,868]],"76":[[1153,868],[1242.5,868],[1242.5,950.74],[1153,947.62]]};

function normalizeVentureKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isThotlaravulapadu(venture) {
  const key = normalizeVentureKey(
    venture?.village || venture?.venture_name || venture?.name
  );
  return key.includes("thotlaravulapadu") || key.includes("totaravulapadu");
}

function ThotlaravulapaduLayoutMap({ venture }) {
  const viewportRef = useRef(null);
  const svgRef = useRef(null);
  const viewBoxRef = useRef({ x: 0, y: 0, width: THOT_WIDTH, height: THOT_HEIGHT });
  const activePointersRef = useRef(new Map());
  const gestureRef = useRef(null);

  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: THOT_WIDTH, height: THOT_HEIGHT });
  const [isDragging, setIsDragging] = useState(false);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 8;
  const BUTTON_ZOOM_FACTOR = 1.25;
  const STATUS_OPACITY = 0.95;
  const zoom = THOT_WIDTH / viewBox.width;

  const clampThotViewBox = useCallback((next) => {
    const width = clamp(next.width, THOT_WIDTH / MAX_ZOOM, THOT_WIDTH / MIN_ZOOM);
    const height = clamp(next.height, THOT_HEIGHT / MAX_ZOOM, THOT_HEIGHT / MIN_ZOOM);

    const maxX = Math.max(0, THOT_WIDTH - width);
    const maxY = Math.max(0, THOT_HEIGHT - height);

    return {
      x: clamp(next.x, 0, maxX),
      y: clamp(next.y, 0, maxY),
      width,
      height,
    };
  }, []);

  const applyViewBox = useCallback((next) => {
    const safe = clampThotViewBox(next);
    viewBoxRef.current = safe;
    setViewBox(safe);
  }, [clampThotViewBox]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute(
      "viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    );
  }, [viewBox]);

  const screenToSvg = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;

    const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  }, []);

  const getRenderedSvgMetrics = useCallback((targetViewBox) => {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const scale = Math.min(
      rect.width / targetViewBox.width,
      rect.height / targetViewBox.height
    );

    const renderedWidth = targetViewBox.width * scale;
    const renderedHeight = targetViewBox.height * scale;

    return {
      rect,
      scale,
      offsetX: (rect.width - renderedWidth) / 2,
      offsetY: (rect.height - renderedHeight) / 2,
    };
  }, []);

  const zoomToAtScreenPoint = useCallback((nextZoomValue, clientX, clientY) => {
    const anchor = screenToSvg(clientX, clientY);
    if (!anchor) return;

    const nextZoom = clamp(nextZoomValue, MIN_ZOOM, MAX_ZOOM);
    const nextWidth = THOT_WIDTH / nextZoom;
    const nextHeight = THOT_HEIGHT / nextZoom;
    const nextViewBox = {
      x: 0,
      y: 0,
      width: nextWidth,
      height: nextHeight,
    };

    const metrics = getRenderedSvgMetrics(nextViewBox);
    if (!metrics) return;

    const localX = clientX - metrics.rect.left - metrics.offsetX;
    const localY = clientY - metrics.rect.top - metrics.offsetY;

    nextViewBox.x = anchor.x - localX / metrics.scale;
    nextViewBox.y = anchor.y - localY / metrics.scale;

    applyViewBox(nextViewBox);
  }, [applyViewBox, getRenderedSvgMetrics, screenToSvg]);

  const zoomAtCenter = useCallback((nextZoom) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    zoomToAtScreenPoint(
      nextZoom,
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  }, [zoomToAtScreenPoint]);

  const fitMap = useCallback(() => {
    applyViewBox({ x: 0, y: 0, width: THOT_WIDTH, height: THOT_HEIGHT });
  }, [applyViewBox]);

  const resetMap = useCallback(() => {
    applyViewBox({ x: 0, y: 0, width: THOT_WIDTH, height: THOT_HEIGHT });
  }, [applyViewBox]);

  const loadPlots = useCallback(async () => {
    if (!venture?.id) {
      setPlots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: plotError } = await supabase
        .from("plots")
        .select("*")
        .eq("venture_id", venture.id)
        .order("plot_no", { ascending: true });

      if (plotError) throw plotError;
      setPlots(data || []);
    } catch (err) {
      console.error("Thotlaravulapadu plot loading error:", err);
      setError(err?.message || "Unable to load plots for this venture.");
      setPlots([]);
    } finally {
      setLoading(false);
    }
  }, [venture?.id]);

  useEffect(() => {
    loadPlots();
  }, [loadPlots]);

  useEffect(() => {
    viewBoxRef.current = { x: 0, y: 0, width: THOT_WIDTH, height: THOT_HEIGHT };
    setViewBox(viewBoxRef.current);
    setIsDragging(false);
    activePointersRef.current.clear();
    gestureRef.current = null;
  }, [venture?.id]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const resizeObserver = new ResizeObserver(() => {
      applyViewBox(viewBoxRef.current);
    });

    resizeObserver.observe(viewport);
    return () => resizeObserver.disconnect();
  }, [applyViewBox]);

  const plotByNumber = useMemo(() => {
    const map = new Map();
    plots.forEach((plot) => map.set(String(plot.plot_no), plot));
    return map;
  }, [plots]);

  const statusOf = useCallback((plot) => normalizeStatus(plot?.status), []);
  const bookedCount = plots.filter((p) => statusOf(p) === "booked").length;
  const soldCount = plots.filter((p) => statusOf(p) === "sold").length;
  const availableCount = Math.max(0, THOT_TOTAL_PLOTS - bookedCount - soldCount);

  const startPanGesture = useCallback((event) => {
    const svg = svgRef.current;
    if (!svg) return;

    const metrics = getRenderedSvgMetrics(viewBoxRef.current);
    if (!metrics) return;

    gestureRef.current = {
      type: "pan",
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startViewBox: { ...viewBoxRef.current },
      scale: metrics.scale,
    };
    setIsDragging(true);
  }, [getRenderedSvgMetrics]);

  const startPinchGesture = useCallback(() => {
    const pointers = Array.from(activePointersRef.current.values());
    if (pointers.length < 2) return;

    const first = pointers[0];
    const second = pointers[1];
    const midpointX = (first.clientX + second.clientX) / 2;
    const midpointY = (first.clientY + second.clientY) / 2;
    const anchor = screenToSvg(midpointX, midpointY);
    if (!anchor) return;

    const distance = Math.max(
      1,
      Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
    );

    gestureRef.current = {
      type: "pinch",
      startDistance: distance,
      startZoom: THOT_WIDTH / viewBoxRef.current.width,
      anchor,
    };
    setIsDragging(false);
  }, [screenToSvg]);

  const handlePointerDown = useCallback((event) => {
    if (event.target?.closest?.(".zoom-controls")) return;

    activePointersRef.current.set(event.pointerId, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    });

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    if (activePointersRef.current.size >= 2) {
      startPinchGesture();
      return;
    }

    startPanGesture(event);
  }, [startPanGesture, startPinchGesture]);

  const handlePointerMove = useCallback((event) => {
    if (!activePointersRef.current.has(event.pointerId)) return;

    activePointersRef.current.set(event.pointerId, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    });

    const gesture = gestureRef.current;
    if (!gesture) return;

    if (gesture.type === "pan") {
      if (gesture.pointerId !== event.pointerId) return;

      const dx = event.clientX - gesture.startClientX;
      const dy = event.clientY - gesture.startClientY;

      applyViewBox({
        ...gesture.startViewBox,
        x: gesture.startViewBox.x - dx / gesture.scale,
        y: gesture.startViewBox.y - dy / gesture.scale,
      });
      return;
    }

    const pointers = Array.from(activePointersRef.current.values());
    if (pointers.length < 2) return;

    const first = pointers[0];
    const second = pointers[1];
    const midpointX = (first.clientX + second.clientX) / 2;
    const midpointY = (first.clientY + second.clientY) / 2;
    const distance = Math.max(
      1,
      Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
    );

    const nextZoom = clamp(
      gesture.startZoom * (distance / gesture.startDistance),
      MIN_ZOOM,
      MAX_ZOOM
    );

    const nextViewBox = {
      x: 0,
      y: 0,
      width: THOT_WIDTH / nextZoom,
      height: THOT_HEIGHT / nextZoom,
    };

    const metrics = getRenderedSvgMetrics(nextViewBox);
    if (!metrics) return;

    const localX = midpointX - metrics.rect.left - metrics.offsetX;
    const localY = midpointY - metrics.rect.top - metrics.offsetY;

    nextViewBox.x = gesture.anchor.x - localX / metrics.scale;
    nextViewBox.y = gesture.anchor.y - localY / metrics.scale;

    applyViewBox(nextViewBox);
  }, [applyViewBox, getRenderedSvgMetrics]);

  const handlePointerUp = useCallback((event) => {
    activePointersRef.current.delete(event.pointerId);

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {}

    const remaining = Array.from(activePointersRef.current.entries());

    if (remaining.length === 1) {
      const [pointerId, point] = remaining[0];
      startPanGesture({
        pointerId,
        clientX: point.clientX,
        clientY: point.clientY,
      });
    } else if (remaining.length === 0) {
      gestureRef.current = null;
      setIsDragging(false);
    }
  }, [startPanGesture]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const handleWheel = (event) => {
      event.preventDefault();

      const currentZoom = THOT_WIDTH / viewBoxRef.current.width;
      const modeScale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
          ? viewport.clientHeight
          : 1;

      const factor = Math.exp(-(event.deltaY * modeScale) * 0.0015);
      zoomToAtScreenPoint(
        currentZoom * factor,
        event.clientX,
        event.clientY
      );
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [zoomToAtScreenPoint]);

  return (
    <div className="layout-page">
      <header className="layout-header">
        <div className="header-title">
          <h1>Thotlaravulapadu Layout</h1>
          <p>R.S. No. 183/2 • Thotlaravulapadu (V), Chandarlapadu (M), NTR (D), AP</p>
        </div>

        <div className="summary-cards">
          <div className="summary-card total"><strong>{THOT_TOTAL_PLOTS}</strong><span>Total</span></div>
          <div className="summary-card available"><strong>{availableCount}</strong><span>Available</span></div>
          <div className="summary-card booked"><strong>{bookedCount}</strong><span>Booked</span></div>
          <div className="summary-card sold"><strong>{soldCount}</strong><span>Sold</span></div>
        </div>
      </header>

      <div className="layout-toolbar">
        <div className="legend">
          <div className="legend-item"><span className="legend-dot available-dot" />Available</div>
          <div className="legend-item"><span className="legend-dot booked-dot" />Booked</div>
          <div className="legend-item"><span className="legend-dot sold-dot" />Sold</div>
        </div>

        <div className="zoom-controls" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => zoomAtCenter(zoom / BUTTON_ZOOM_FACTOR)} disabled={zoom <= MIN_ZOOM + 0.001}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => zoomAtCenter(zoom * BUTTON_ZOOM_FACTOR)} disabled={zoom >= MAX_ZOOM - 0.001}>+</button>
          <button type="button" onClick={fitMap}>Fit</button>
          <button type="button" onClick={resetMap}>Reset</button>
        </div>
      </div>

      <main
        ref={viewportRef}
        className={`map-viewport thot-map-viewport ${isDragging ? "is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="map-background" />

        <svg
          ref={svgRef}
          className="thot-layout-svg"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Thotlaravulapadu layout map"
        >
          <image
            href={THOT_SVG_URL}
            x="0"
            y="0"
            width={THOT_WIDTH}
            height={THOT_HEIGHT}
            preserveAspectRatio="none"
            pointerEvents="none"
          />

          <g className="thot-status-layer" pointerEvents="none">
            {Object.entries(THOT_PLOT_POLYGONS).map(([plotNo, points]) => {
              const status = statusOf(plotByNumber.get(plotNo));
              const fill =
                status === "sold"
                  ? STATUS_META.sold.fill
                  : status === "booked"
                  ? STATUS_META.booked.fill
                  : "transparent";

              return (
                <polygon
                  key={plotNo}
                  className="thot-plot-status"
                  data-status={status}
                  points={points.map(([x, y]) => `${x},${y}`).join(" ")}
                  fill={fill}
                  fillOpacity={status === "available" ? 0 : STATUS_OPACITY}
                  stroke="none"
                />
              );
            })}
          </g>
        </svg>

        {loading && (
          <div className="map-loading"><div className="loading-spinner" /><p>Loading Thotlaravulapadu plots...</p></div>
        )}

        {error && (
          <div className="map-error"><h2>Unable to load plots</h2><p>{error}</p></div>
        )}

        <div className="map-help">
          <span>{THOT_TOTAL_PLOTS} plots</span><span>•</span><span>Drag to pan</span><span>•</span><span>Wheel/pinch to zoom</span>
        </div>
      </main>
    </div>
  );
}
/* =========================================================
   VENTURE / PHASE SWITCHER — ADDITION ONLY
   ========================================================= */
export default function LayoutMap() {
  const [ventures, setVentures] = useState([]);
  const [selectedVentureId, setSelectedVentureId] = useState("");
  const [loadingVentures, setLoadingVentures] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadVentures() {
      const { data, error } = await supabase
        .from("ventures")
        .select("id, venture_name, village, phase_name, total_plots")
        .order("village", { ascending: true })
        .order("phase_name", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Unable to load ventures:", error);
        setVentures([]);
      } else {
        const list = data || [];
        setVentures(list);

        const preferred =
          list.find(
            (v) => v.village === "Gudimetla" && v.phase_name === "Phase 1"
          ) || list[0];

        if (preferred) setSelectedVentureId(preferred.id);
      }

      setLoadingVentures(false);
    }

    loadVentures();
    return () => {
      active = false;
    };
  }, []);

  const selectedVenture = useMemo(
    () => ventures.find((v) => String(v.id) === String(selectedVentureId)) || null,
    [ventures, selectedVentureId]
  );

  return (
    <div className="layout-feature-shell">
      <div className="layout-venture-selector">
        <label htmlFor="layout-venture-select">Venture / Phase</label>
        <select
          id="layout-venture-select"
          value={selectedVentureId}
          onChange={(event) => setSelectedVentureId(event.target.value)}
          disabled={loadingVentures}
        >
          <option value="">
            {loadingVentures ? "Loading ventures..." : "Select Venture / Phase"}
          </option>
          {ventures.map((venture) => (
            <option key={venture.id} value={venture.id}>
              {venture.village} — {venture.phase_name}
            </option>
          ))}
        </select>
      </div>

      {selectedVenture ? (
        isThotlaravulapadu(selectedVenture) ? (
          <ThotlaravulapaduLayoutMap venture={selectedVenture} />
        ) : (
          <GudimetlaLayoutMap venture={selectedVenture} />
        )
      ) : (
        <div className="layout-empty-state">
          Select a venture to display its layout map.
        </div>
      )}
    </div>
  );
}
