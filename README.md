SC Cargo Hauling Tool v2  – Early Release

Hi again! I've been working over the last couple of weeks to see if I could improve on my first attempt on making a cargo routing tool and here it is :) This is a complete recode from my first attempt that uses a genetic algorithm to determine an optimal route. 
Key New Features: 
- Route summary improvements
- Support for cargo capacity requirements
- Genetic Algorithm for route calculation based of shortest distance, with controllable parameters 
- Accurate location data from in game
- New UI (not finalised) 


While the user interface is still being refined, the core functionality is operational. Please be aware that the generated routes may not always be the most efficient and has some logic mission (at the moment it doesnt prioritize starting location pick ups and may tell you to come back), so it may be necessary to run the calculations multiple times to achieve the shortest possible route. Also tweak the parameters to potentially generate a more efficient route.

How to use the Tool 

To get started, input your mission data by selecting your starting location and defining your cargo capacity. Add your cargo hauling missions by specifying the mission type—whether it's a direct mission, multiple drop-offs, or multiple pickups—and provide the necessary details such as cargo types, quantities, and destinations. Once your missions are set, the tool employs a Genetic Algorithm to calculate the optimal route based on your inputs. After the calculation, review the route summary to see the total distance, rewards, and detailed steps for your missions. Keep iterating the calculations to refine and find the most efficient route as the tool continues to evolve.
