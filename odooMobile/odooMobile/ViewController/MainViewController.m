//
//  MainViewController.m
//

#import "MainViewController.h"
#import "Preferences.h"
#import "HUD.h"
#import "GlobalModels.h"

/*!
 *  @author LeiQiao, 16-04-22
 *  @brief 主界面视图
 */
@implementation MainViewController

#pragma mark
#pragma mark init & dealloc

-(void) viewDidLoad
{
    [super viewDidLoad];
}

-(void) viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
    
    // 如果用户已经登陆
    if( [gPreferences.UserID integerValue] > 0 ) return;
    
    // 如果登陆要素为空，则弹出登录框
    if( (gPreferences.ServerName.length == 0) ||
       (gPreferences.DBName.length == 0) ||
       (gPreferences.UserName.length == 0) ||
       (gPreferences.Password.length == 0) )
    {
        [self performSegueWithIdentifier:@"LoginSegue" sender:self];
    }
    // 如果登陆要素不为空，则静默登陆
    else
    {
        popWaiting();
        ADDOBSERVER(UserModel, (id<UserModelObserver>)self);
        [GETMODEL(UserModel) login:gPreferences.ServerName
                            dbName:gPreferences.DBName
                          userName:gPreferences.UserName
                          password:gPreferences.Password];
    }
}

-(void) viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    
    REMOVEOBSERVER(UserModel, (id<UserModelObserver>)self);
}

#pragma mark
#pragma mark UserModelObserver

-(void) userModel:(UserModel*)userModel login:(ReturnParam*)params
{
    dismissWaiting();
    
    if( !params.success )
    {
        popError(params.failedReason);
        
        // 登录失败弹出登录框
        [self performSegueWithIdentifier:@"LoginSegue" sender:self];
        return;
    }
}

@end