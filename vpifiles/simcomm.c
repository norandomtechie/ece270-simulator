#include <vpi_user.h>
#include <string.h>
#include <stdio.h>
#include <errno.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <time.h>
#include <math.h>

static char input[1024];
static char newinput[1024];

static int rpipe;
static int wpipe;
static time_t start_time;

static PLI_INT32 getoutput_cmp(char *user_data)
{
  return 0;
}

int pin(uint64_t a, int b)
{
  return (a >> ((uint64_t)b)) & 1;
}

uint64_t bselect(uint64_t bus, int a, int b)
{
  uint64_t x = 0;
  for (int i = a; i > b; i--)
  {
    x |= pin(bus, i);
    x <<= (uint64_t)1;
  }
  x |= (uint64_t)pin(bus, b);
  return x;
}

static uint64_t prev_ssa = -1;
static uint64_t prev_ssb = -1;
static uint64_t prev_misc = -1;

// left   bselect(misc, 28, 21)
// right  bselect(misc, 20, 13)
// red    pin(misc, 4)
// green  pin(misc, 3)
// blue   pin(misc, 2)
// ss0    bselect(ss, 7, 0)
// ss1    bselect(ss, 15, 8)
// ss2    bselect(ss, 23, 16)
// ss3    bselect(ss, 31, 24)
// ss4    bselect(ss, 39, 32)
// ss5    bselect(ss, 47, 40)
// ss6    bselect(ss, 55, 48)
// ss7    bselect(ss, 63, 56)
// txclk  pin(misc, 1)
// rxclk  pin(misc, 0)
// txdata bselect(misc, 12, 5)

static PLI_INT32 getoutput(char *user_data)
{
  // get values from args
  // ss7-ss0 (64-bit uint64_t) ss
  // left,right,txdata,red,green,blue,txclk,rxclk (29-bit uint64_t) misc

  // init
  s_vpi_value value_s;
  vpiHandle systf_handle, arg_itr, arg_handle;
  uint64_t ssa, ssb, misc;
  value_s.format = vpiRealVal;

  // iterate args
  systf_handle = vpi_handle(vpiSysTfCall, NULL);
  arg_itr = vpi_iterate(vpiArgument, systf_handle);

  // get ss_a
  arg_handle = vpi_scan(arg_itr);
  vpi_get_value(arg_handle, &value_s);
  ssa = value_s.value.real;

  // get ss_b
  arg_handle = vpi_scan(arg_itr);
  vpi_get_value(arg_handle, &value_s);
  ssb = value_s.value.real;

  // get misc
  arg_handle = vpi_scan(arg_itr);
  vpi_get_value(arg_handle, &value_s);
  misc = value_s.value.real;

  vpi_free_object(arg_itr);

  if ((prev_ssa != ssa) || (prev_ssb != ssb) || (prev_misc != misc))
  {
    char buffer[500];
    snprintf(buffer, 300, "{\"LFTRED\":%d,\"RGTRED\":%d,\"REDLED\":%d,\"GRNLED\":%d,\"BLULED\":%d,\"SS7\":%d,\"SS6\":%d,\"SS5\":%d,\"SS4\":%d,\"SS3\":%d,\"SS2\":%d,\"SS1\":%d,\"SS0\":%d,\"TXCLK\":%d,\"RXCLK\":%d,\"TXDATA\":%d}\n",
             (int)bselect(misc, 28, 21), (int)bselect(misc, 20, 13), pin(misc, 4), pin(misc, 3), pin(misc, 2), 
             (int)bselect(ssa, 31, 24), (int)bselect(ssa, 23, 16), (int)bselect(ssa, 15, 8), (int)bselect(ssa, 7, 0),
             (int)bselect(ssb, 31, 24), (int)bselect(ssb, 23, 16), (int)bselect(ssb, 15, 8), (int)bselect(ssb, 7, 0),
             pin(misc, 1), pin(misc, 0), (int)bselect(misc, 12, 5));
    int res = write(wpipe, buffer, strlen(buffer) + 1);
    if (res == 1)
    {
      // continue for now
    }
    prev_ssa = ssa;
    prev_ssb = ssb;
    prev_misc = misc;
  }
  return (0);
}

static PLI_INT32 sendinput_cmp(char *user_data)
{
  return 0;
}

static PLI_INT32 sendinput_sizetf(char *user_data)
{
  return (32);
}

void timer_watch (void)
{
  time_t now = time (NULL);
  if (now - start_time > 60*10)
  {
    char buffer [100];
    snprintf (buffer, 100, "\nTime limit of 10 minutes exceeded! Stopping simulation.\n");
    write(wpipe, buffer, strlen(buffer) + 1);
    vpi_control(vpiFinish, 1);
    exit(1);
  }
}

void get_input()
{
  //ffffffffffffffffffff - for pb, 20
  //ffffffffff -           for {rxdata, rxready, txready}, 10
  while (strcmp(input, "\0") == 0 || input_timeout(rpipe))
  {
    int res = read(rpipe, newinput, 128);
    if (res == 1)
    {
      // continue for now
    }
    if (strstr(newinput, "END SIMULATION") != NULL)
    {
      vpi_control(vpiFinish, 0);
      exit(0);
    }
    for (int i = 29; i >= 0; i--)
      input[i] = newinput[29 - i];
  }
}

static int hz100 = -1;
static PLI_INT32 sendinput(char *user_data)
{
  timer_watch();
  get_input();
  // get value from pipe
  PLI_INT32 in_val = 0;
  // toggle hz100
  in_val = hz100 = (hz100 == 0) ? 1 : 0;
  // txready = input[29] == 'f' ? 0 : 1;
  in_val = (in_val << 1) | (input[29] == 'f' ? 0 : 1);
  // rxready = input[28] == 'f' ? 0 : 1;
  in_val = (in_val << 1) | (input[28] == 'f' ? 0 : 1);
  // for rxready
  for (int i = 27; i >= 20; i--)
    in_val = (in_val << 1) | (input[i] == 'f' ? 0 : 1);
  // for pb
  for (int i = 0; i < 20; i++)
    in_val = (in_val << 1) | (input[i] == 'f' ? 0 : 1);

  // printf("in_val: %d\n", in_val);

  s_vpi_value value_s;
  vpiHandle systf_handle;

  systf_handle = vpi_handle(vpiSysTfCall, NULL);

  value_s.format = vpiIntVal;
  value_s.value.integer = (PLI_INT32)in_val;
  // returns value to Verilog function call
  vpi_put_value(systf_handle, &value_s, NULL, vpiNoDelay);
  return 0;
}

/******************************************************************************/
// https://www.gnu.org/software/libc/manual/html_node/Waiting-for-I_002fO.html
/******************************************************************************/
// this function sets the delay for the hz100 signal in timeout.tv_usec.
// By waiting every 5ms for new inputs and toggling hz100 at each interval,
// we end up creating a 100 Hz square wave.
//
//  cycles:     0            1             2
//  hz100:      ______-------_______-------_______------
//  Time (ms):  0.....5.....10.....15.....20.....25.....
//

int input_timeout(int filedes)
{
  fd_set set;
  struct timeval timeout;

  /* Initialize the file descriptor set. */
  FD_ZERO(&set);
  FD_SET(filedes, &set);

  /* Initialize the timeout data structure. */
  timeout.tv_sec = 0;
  timeout.tv_usec = 5000;

  /* select returns 0 if timeout, 1 if input available, -1 if error. */
  return TEMP_FAILURE_RETRY(select(FD_SETSIZE,
                                   &set, NULL, NULL,
                                   &timeout));
}
/******************************************************************************/

void init_vpi()
{
  // init pipes
  char *w;
  char *r;

  static int init_pipes_flag = 0;

  if (!init_pipes_flag)
  {
    if ((w = getenv("RECV_PIPE")) == NULL)
    {
      printf("ERROR: no write pipe to client\n");
      vpi_control(vpiFinish, 1);
      exit(1);
    }
    if ((r = getenv("SEND_PIPE")) == NULL)
    {
      printf("ERROR: no read pipe from client\n");
      vpi_control(vpiFinish, 1);
      exit(1);
    }
    wpipe = atoi(w);
    rpipe = atoi(r);
    init_pipes_flag = 1;
  }

  // init time
  start_time = time(NULL);
  get_input();
}

void vpifunc_register()
{
  s_vpi_systf_data tf_data;

  tf_data.type = vpiSysTask;
  tf_data.tfname = "$getoutput";
  tf_data.calltf = getoutput;
  tf_data.compiletf = getoutput_cmp;
  tf_data.sizetf = NULL;
  tf_data.user_data = NULL;
  vpi_register_systf(&tf_data);

  tf_data.type = vpiSysFunc;
  tf_data.sysfunctype = vpiSysFuncSized;
  tf_data.tfname = "$sendinput";
  tf_data.calltf = sendinput;
  tf_data.compiletf = sendinput_cmp;
  tf_data.sizetf = sendinput_sizetf;
  tf_data.user_data = NULL;
  vpi_register_systf(&tf_data);
}

void (*vlog_startup_routines[])() = {
    init_vpi,
    vpifunc_register,
    0 // must be a 0 to indicate termination
};